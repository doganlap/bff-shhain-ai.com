import React, { useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { useTheme } from '../../components/theme/ThemeProvider';
import apiService from '../../services/apiEndpoints';
import { 
  FileText, Upload, Download, Eye, Edit, Trash2, Plus, 
  Search, Filter, Calendar, User, CheckCircle, AlertTriangle,
  Clock, Paperclip, Image, FileVideo, FileAudio, BarChart3,
  TrendingUp, PieChart, Activity, Target, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner } from '../../components/Animation/InteractiveAnimationToolkit';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';

const Evidence = () => {
  const { t, isRTL } = useI18n();
  const { isDark } = useTheme();
  
  // State
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [evidenceStats, setEvidenceStats] = useState({
    totalEvidence: 0,
    approvedEvidence: 0,
    pendingEvidence: 0,
    rejectedEvidence: 0,
    byFramework: [],
    byRegulator: [],
    byStatus: [],
    recentActivity: []
  });
  const [evidenceAnalytics, setEvidenceAnalytics] = useState({
    complianceRate: '0%',
    avgApprovalTime: '0 days',
    topCategories: [],
    trendData: [],
    riskCoverage: '0%'
  });
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    control_id: 'all',
    search: '',
  });
  const { language, changeLanguage } = useI18n();
  
  // Fetch evidence data
  useEffect(() => {
    fetchEvidence();
    loadEvidenceCategories();
    loadEvidenceStats();
    loadEvidenceAnalytics();
  }, [filters]);

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      const response = await apiService.evidence.getAll(filters);
      const evidenceData = response.data || response || [];
      setEvidence(evidenceData);
    } catch (error) {
      console.error('Error fetching evidence:', error);
      setError('Failed to load evidence');
      toast.error(language === 'ar' ? 'فشل تحميل الأدلة' : 'Failed to load evidence');
      setEvidence([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEvidenceCategories = async () => {
    try {
      const response = await apiService.evidence.getCategories();
      const categoriesData = response.data || response || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading evidence categories:', error);
    }
  };

  const loadEvidenceStats = async () => {
    try {
      const response = await apiService.evidence.getStats();
      if (response?.data) {
        setEvidenceStats(response.data);
      }
    } catch (error) {
      console.error('Error loading evidence stats:', error);
    }
  };

  const loadEvidenceAnalytics = async () => {
    try {
      const response = await apiService.evidence.getAnalytics();
      if (response?.data) {
        setEvidenceAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading evidence analytics:', error);
    }
  };
  
  // Upload evidence
  const handleUploadEvidence = async (file, metadata) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));
      
      const response = await apiService.evidence.upload(formData);
      if (response?.data?.success) {
        toast.success('Evidence uploaded successfully');
        setShowUploadModal(false);
        fetchEvidence();
      }
    } catch (error) {
      console.error('Error uploading evidence:', error);
      toast.error('Failed to upload evidence');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete evidence
  const handleDeleteEvidence = async (id) => {
    try {
      await apiService.evidence.delete(id);
      toast.success('Evidence deleted successfully');
      fetchEvidence();
    } catch (error) {
      console.error('Error deleting evidence:', error);
      toast.error('Failed to delete evidence');
    }
  };
  
  const getFileIcon = (fileType) => {
    if (fileType?.includes('image')) return <Image className="w-5 h-5" />;
    if (fileType?.includes('video')) return <FileVideo className="w-5 h-5" />;
    if (fileType?.includes('audio')) return <FileAudio className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('evidence.title', 'Evidence Management')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('evidence.subtitle', 'Manage and track compliance evidence')}
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-5 h-5" />
          {t('evidence.upload', 'Upload Evidence')}
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('evidence.search', 'Search evidence...')}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('evidence.allTypes', 'All Types')}</option>
            <option value="document">{t('evidence.document', 'Document')}</option>
            <option value="screenshot">{t('evidence.screenshot', 'Screenshot')}</option>
            <option value="video">{t('evidence.video', 'Video')}</option>
            <option value="other">{t('evidence.other', 'Other')}</option>
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('evidence.allStatuses', 'All Statuses')}</option>
            <option value="pending">{t('evidence.pending', 'Pending')}</option>
            <option value="approved">{t('evidence.approved', 'Approved')}</option>
            <option value="rejected">{t('evidence.rejected', 'Rejected')}</option>
          </select>
          
          <button
            onClick={fetchEvidence}
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-5 h-5" />
            {t('evidence.filter', 'Filter')}
          </button>
        </div>
      </div>
      
      {/* Evidence List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {evidence.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {t('evidence.noEvidence', 'No evidence found')}
            </p>
            <p className="text-gray-400 mt-2">
              {t('evidence.uploadFirst', 'Upload your first piece of evidence to get started')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('evidence.file', 'File')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('evidence.control', 'Control')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('evidence.status', 'Status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('evidence.uploadedBy', 'Uploaded By')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('evidence.date', 'Date')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('evidence.actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {evidence.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFileIcon(item.file_type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.file_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.file_size} • {item.file_type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {item.control_name || item.control_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {t(`evidence.status.${item.status}`, item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {item.uploaded_by_name || item.uploaded_by}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedEvidence(item);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title={t('evidence.view', 'View')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(item.download_url, '_blank')}
                          className="text-green-600 hover:text-green-900 p-1"
                          title={t('evidence.download', 'Download')}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvidence(item.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title={t('evidence.delete', 'Delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Evidence; 
