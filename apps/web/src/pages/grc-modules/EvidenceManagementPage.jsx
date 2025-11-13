import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Upload, Download, Eye, Edit, Trash2, Search, 
  Filter, Star, Tag, Calendar, User, CheckCircle, Clock, 
  XCircle, AlertTriangle, Folder, Image, File, Archive,
  RefreshCw, Plus, Grid, List, SortAsc, Share2
} from 'lucide-react';
import { toast } from 'sonner';

// Services and Hooks
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../components/theme/ThemeProvider';
import apiService from '../../services/apiEndpoints';

// Advanced Components
import {
  PermissionBasedCard,
  PermissionBasedButton,
  RoleDashboardCards
} from '../../components/common/PermissionBasedCard';
import AdvancedAnalyticsPanel from '../../components/analytics/AdvancedAnalyticsPanel';
import RealTimeMonitor from '../../components/monitoring/RealTimeMonitor';
import QuickActionsToolbar from '../../components/ui/QuickActionsToolbar';
import { AnimatedCard, CulturalLoadingSpinner } from '../../components/Animation/InteractiveAnimationToolkit';

const EvidenceManagementPage = () => {
  const { t, language, isRTL } = useI18n();
  const { isDark } = useTheme();

  // State Management
  const [evidence, setEvidence] = useState([]);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [analyticsMode, setAnalyticsMode] = useState('standard');
  const [viewMode, setViewMode] = useState('grid');

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Analytics Data
  const [analyticsData, setAnalyticsData] = useState({
    totalEvidence: 0,
    recentUploads: 0,
    categories: {},
    sizeStats: {},
    trends: []
  });

  useEffect(() => {
    fetchEvidence();
    fetchAnalytics();
    
    if (realTimeEnabled) {
      const interval = setInterval(() => {
        fetchAnalytics();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [searchTerm, filterBy, sortBy, categoryFilter, realTimeEnabled]);

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      const response = await apiService.evidence.getAll({
        search: searchTerm,
        status: filterBy !== 'all' ? filterBy : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        sort: sortBy,
        include_metadata: true
      });

      if (response?.data?.success) {
        setEvidence(response.data.data || []);
      } else {
        setEvidence([]);
      }
    } catch (error) {
      console.error('Error fetching evidence:', error);
      toast.error(t('evidence.error.fetch_failed'));
      setEvidence([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await apiService.evidence.getAnalytics();
      if (response?.data?.success) {
        setAnalyticsData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching evidence analytics:', error);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'upload':
        document.getElementById('evidence-upload').click();
        break;
      case 'export':
        exportEvidence();
        break;
      case 'refresh':
        fetchEvidence();
        break;
      case 'analytics':
        setAnalyticsMode(analyticsMode === 'standard' ? 'advanced' : 'standard');
        break;
      case 'realtime':
        setRealTimeEnabled(!realTimeEnabled);
        break;
      case 'view':
        setViewMode(viewMode === 'grid' ? 'list' : 'grid');
        break;
      default:
        console.log('Action:', action);
    }
  };

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

        return apiService.evidence.upload(formData);
      });

      await Promise.all(uploadPromises);
      toast.success(t('evidence.upload.success'));
      fetchEvidence();
      fetchAnalytics();
    } catch (error) {
      console.error('Error uploading evidence:', error);
      toast.error(t('evidence.upload.failed'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const exportEvidence = async () => {
    try {
      const exportData = {
        evidence,
        analytics: analyticsData,
        timestamp: new Date().toISOString(),
        filters: { searchTerm, filterBy, sortBy, categoryFilter }
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evidence-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(t('evidence.export.success'));
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(t('evidence.export.failed'));
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return Image;
    if (fileType?.includes('pdf')) return FileText;
    return File;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'rejected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredEvidence = evidence.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || item.status === filterBy;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CulturalLoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'ar' ? 'إدارة الأدلة والوثائق' : 'Evidence Management'}
            </h1>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'ar' 
                ? 'إدارة شاملة لأدلة الامتثال والوثائق الداعمة' 
                : 'Comprehensive management of compliance evidence and supporting documents'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {filteredEvidence.length} {language === 'ar' ? 'وثيقة' : 'documents'}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActionsToolbar
          actions={[
            { id: 'upload', label: language === 'ar' ? 'رفع وثيقة' : 'Upload Evidence', icon: 'upload', variant: 'primary' },
            { id: 'export', label: language === 'ar' ? 'تصدير' : 'Export', icon: 'download', variant: 'secondary' },
            { id: 'refresh', label: language === 'ar' ? 'تحديث' : 'Refresh', icon: 'refresh', variant: 'secondary' },
            { id: 'view', label: viewMode === 'grid' ? (language === 'ar' ? 'عرض قائمة' : 'List View') : (language === 'ar' ? 'عرض شبكي' : 'Grid View'), icon: viewMode === 'grid' ? 'list' : 'grid', variant: 'secondary' },
            { id: 'analytics', label: analyticsMode === 'standard' ? (language === 'ar' ? 'تحليلات متقدمة' : 'Advanced Analytics') : (language === 'ar' ? 'عرض أساسي' : 'Standard View'), icon: 'chart', variant: 'secondary' },
            { id: 'realtime', label: realTimeEnabled ? (language === 'ar' ? 'إيقاف الوقت الفعلي' : 'Disable Real-time') : (language === 'ar' ? 'تفعيل الوقت الفعلي' : 'Enable Real-time'), icon: 'pulse', variant: 'secondary' }
          ]}
          onAction={handleQuickAction}
          loading={uploading}
        />

        {/* Hidden File Input */}
        <input
          id="evidence-upload"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xlsx,.jpg,.jpeg,.png,.gif"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Analytics Dashboard */}
        <RoleDashboardCards
          data={{
            kpis: {
              totalEvidence: { value: analyticsData.totalEvidence || 0, trend: 'up', delta: '+5', status: 'info' },
              recentUploads: { value: analyticsData.recentUploads || 0, trend: 'up', delta: '+2', status: 'success' },
              categories: { value: Object.keys(analyticsData.categories || {}).length, trend: 'neutral', delta: '0', status: 'info' },
              storageUsed: { value: formatFileSize(analyticsData.sizeStats?.total || 0), trend: 'up', delta: '+10%', status: 'warning' }
            }
          }}
          loading={loading}
        />

        {/* Advanced Analytics Panel */}
        {analyticsMode === 'advanced' && (
          <PermissionBasedCard
            requiredPermission="evidence.view_analytics"
            title={language === 'ar' ? 'تحليلات متقدمة للأدلة' : 'Advanced Evidence Analytics'}
            subtitle={language === 'ar' ? 'رؤى شاملة لإدارة الوثائق والأدلة' : 'Comprehensive insights into document and evidence management'}
          >
            <AdvancedAnalyticsPanel
              data={{
                trends: analyticsData.trends || [],
                distribution: Object.entries(analyticsData.categories || {}).map(([name, count]) => ({
                  name,
                  value: count,
                  color: '#3b82f6'
                })),
                heatmap: filteredEvidence.map(e => ({
                  document: e.name,
                  category: e.category,
                  status: e.status
                }))
              }}
              filters={{ searchTerm, filterBy, sortBy, categoryFilter }}
              loading={loading}
            />
          </PermissionBasedCard>
        )}

        {/* Search and Filters */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'البحث في الوثائق...' : 'Search documents...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                <option value="approved">{language === 'ar' ? 'معتمد' : 'Approved'}</option>
                <option value="pending">{language === 'ar' ? 'قيد المراجعة' : 'Pending'}</option>
                <option value="rejected">{language === 'ar' ? 'مرفوض' : 'Rejected'}</option>
              </select>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
                <option value="policy">{language === 'ar' ? 'سياسة' : 'Policy'}</option>
                <option value="procedure">{language === 'ar' ? 'إجراء' : 'Procedure'}</option>
                <option value="audit">{language === 'ar' ? 'مراجعة' : 'Audit'}</option>
                <option value="compliance">{language === 'ar' ? 'امتثال' : 'Compliance'}</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="created_at">{language === 'ar' ? 'تاريخ الإضافة' : 'Date Added'}</option>
                <option value="name">{language === 'ar' ? 'الاسم' : 'Name'}</option>
                <option value="size">{language === 'ar' ? 'الحجم' : 'Size'}</option>
                <option value="status">{language === 'ar' ? 'الحالة' : 'Status'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Evidence Grid/List */}
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-4'
        }>
          {filteredEvidence.map((item) => {
            const FileIcon = getFileIcon(item.file_type);
            const StatusIcon = getStatusIcon(item.status);
            
            if (viewMode === 'list') {
              return (
                <AnimatedCard
                  key={item.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedEvidence(item)}
                >
                  <div className="flex items-center gap-4">
                    <FileIcon className="w-10 h-10 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </h3>
                      <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.description || (language === 'ar' ? 'لا يوجد وصف' : 'No description')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        {formatFileSize(item.file_size || 0)}
                      </span>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        {new Date(item.created_at || Date.now()).toLocaleDateString()}
                      </span>
                      <StatusIcon className={`w-5 h-5 ${getStatusColor(item.status)}`} />
                    </div>
                  </div>
                </AnimatedCard>
              );
            }

            return (
              <AnimatedCard
                key={item.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => setSelectedEvidence(item)}
              >
                <div className="flex items-start justify-between mb-4">
                  <FileIcon className="w-12 h-12 text-blue-600" />
                  <StatusIcon className={`w-5 h-5 ${getStatusColor(item.status)}`} />
                </div>

                <h3 className={`font-semibold mb-2 line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.name}
                </h3>

                <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {item.description || (language === 'ar' ? 'لا يوجد وصف متاح' : 'No description available')}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                    {formatFileSize(item.file_size || 0)}
                  </span>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                    {new Date(item.created_at || Date.now()).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.category === 'policy' ? 'bg-blue-100 text-blue-800' :
                    item.category === 'procedure' ? 'bg-green-100 text-green-800' :
                    item.category === 'audit' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.category || 'General'}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span className="text-xs">
                      {language === 'ar' ? 'عرض' : 'View'}
                    </span>
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredEvidence.length === 0 && !loading && (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              {language === 'ar' ? 'لا توجد وثائق متاحة' : 'No Evidence Available'}
            </h3>
            <p className="mb-4">
              {language === 'ar' 
                ? 'لم يتم العثور على وثائق تطابق معايير البحث' 
                : 'No evidence documents found matching your search criteria'
              }
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterBy('all');
                setCategoryFilter('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {language === 'ar' ? 'مسح المرشحات' : 'Clear Filters'}
            </button>
          </div>
        )}

        {/* Real-time Monitor */}
        {realTimeEnabled && (
          <PermissionBasedCard
            requiredPermission="evidence.view_monitoring"
            title={language === 'ar' ? 'مراقبة الوقت الفعلي' : 'Real-time Monitoring'}
            subtitle={language === 'ar' ? 'تحديثات مباشرة لحالة الوثائق والأدلة' : 'Live updates on document and evidence status'}
          >
            <RealTimeMonitor
              data={{
                kpis: {
                  totalEvidence: { value: analyticsData.totalEvidence || 0, trend: 'up', delta: '+5', status: 'info' },
                  recentUploads: { value: analyticsData.recentUploads || 0, trend: 'up', delta: '+2', status: 'success' }
                },
                activityFeed: filteredEvidence.slice(0, 5).map(e => ({
                  id: e.id,
                  user: e.uploaded_by || 'System',
                  action: 'uploaded',
                  target: e.name,
                  time: new Date(e.created_at || Date.now()).toLocaleTimeString(),
                  status: e.status
                }))
              }}
              enabled={realTimeEnabled}
              loading={loading}
            />
          </PermissionBasedCard>
        )}

      </div>
    </div>
  );
};

export default EvidenceManagementPage;
