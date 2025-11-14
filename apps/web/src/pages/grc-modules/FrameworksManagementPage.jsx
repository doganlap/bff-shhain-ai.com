import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, Search, Eye, AlertCircle, CheckCircle, Clock, XCircle, Edit2, Trash2, Plus, X
} from 'lucide-react';
import { toast } from 'sonner';

// Services and Hooks
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../components/theme/ThemeProvider';
import apiService from '../../services/apiEndpoints';

// Advanced Components
import {
  PermissionBasedCard,
  RoleDashboardCards
} from '../../components/common/PermissionBasedCard';
import AdvancedAnalyticsPanel from '../../components/analytics/AdvancedAnalyticsPanel';
import RealTimeMonitor from '../../components/monitoring/RealTimeMonitor';
import QuickActionsToolbar from '../../components/ui/QuickActionsToolbar';
import { AnimatedCard, CulturalLoadingSpinner } from '../../components/Animation/InteractiveAnimationToolkit';

const FrameworksManagementPage = () => {
  const { t, language } = useI18n();
  const { isDark } = useTheme();

  // State Management
  // const [selectedFramework, setSelectedFramework] = useState(null);
  // const [frameworkDetails, setFrameworkDetails] = useState(null);
  const [frameworks, setFrameworks] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [detailsLoading, setDetailsLoading] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [analyticsMode, setAnalyticsMode] = useState('standard');
  
  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    version: '',
    isActive: true
  });

  // Analytics Data
  const [analyticsData, setAnalyticsData] = useState({
    totalFrameworks: 0,
    activeFrameworks: 0,
    compliance: 0,
    coverage: 0,
    trends: [],
    distribution: []
  });

  const fetchFrameworks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.frameworks.getAll({
        search: searchTerm,
        status: filterBy !== 'all' ? filterBy : undefined,
        sort: sortBy,
        include_stats: true
      });

      if (response?.data?.success) {
        setFrameworks(response.data.data || []);
      } else {
        setFrameworks([]);
      }
    } catch (error) {
      console.error('Error fetching frameworks:', error);
      toast.error(t('frameworks.error.fetch_failed'));
      setFrameworks([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterBy, sortBy, t]);

  useEffect(() => {
    fetchFrameworks();
    fetchAnalytics();
    
    if (realTimeEnabled) {
      const interval = setInterval(() => {
        fetchAnalytics();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchFrameworks, realTimeEnabled]);


  const fetchAnalytics = async () => {
    try {
      const response = await apiService.frameworks.getAnalytics();
      if (response?.data?.success) {
        setAnalyticsData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching framework analytics:', error);
    }
  };

  // const fetchFrameworkDetails = async (frameworkId) => {
  //   try {
  //     setDetailsLoading(true);
  //     const response = await apiService.frameworks.getById(frameworkId);
  //     if (response?.data?.success) {
  //       setFrameworkDetails(response.data.data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching framework details:', error);
  //     toast.error(t('frameworks.error.details_failed'));
  //   } finally {
  //     setDetailsLoading(false);
  //   }
  // };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'add':
        // Open framework creation modal
        toast.success('Opening framework creation...');
        break;
      case 'import':
        // Open import dialog
        toast.success('Opening import dialog...');
        break;
      case 'export':
        exportFrameworks();
        break;
      case 'refresh':
        fetchFrameworks();
        break;
      case 'analytics':
        setAnalyticsMode(analyticsMode === 'standard' ? 'advanced' : 'standard');
        break;
      case 'realtime':
        setRealTimeEnabled(!realTimeEnabled);
        break;
      default:
        console.log('Action:', action);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      version: '',
      isActive: true
    });
    setSelectedFramework(null);
  };

  const handleCreateFramework = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.frameworks.create(formData);
      if (response?.data?.success || response?.status === 201) {
        toast.success(t('frameworks.create.success') || 'Framework created successfully');
        setShowCreateModal(false);
        resetForm();
        fetchFrameworks();
      }
    } catch (error) {
      console.error('Error creating framework:', error);
      toast.error(t('frameworks.create.error') || 'Failed to create framework');
    }
  };

  const handleEditFramework = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.frameworks.update(selectedFramework.id, formData);
      if (response?.data?.success || response?.status === 200) {
        toast.success(t('frameworks.update.success') || 'Framework updated successfully');
        setShowEditModal(false);
        resetForm();
        fetchFrameworks();
      }
    } catch (error) {
      console.error('Error updating framework:', error);
      toast.error(t('frameworks.update.error') || 'Failed to update framework');
    }
  };

  const handleDeleteFramework = async () => {
    try {
      const response = await apiService.frameworks.delete(selectedFramework.id);
      if (response?.data?.success || response?.status === 200) {
        toast.success(t('frameworks.delete.success') || 'Framework deleted successfully');
        setShowDeleteModal(false);
        resetForm();
        fetchFrameworks();
      }
    } catch (error) {
      console.error('Error deleting framework:', error);
      toast.error(t('frameworks.delete.error') || 'Failed to delete framework');
    }
  };

  const handleOpenEditModal = (framework) => {
    setSelectedFramework(framework);
    setFormData({
      name: framework.name || '',
      description: framework.description || '',
      category: framework.category || '',
      version: framework.version || '',
      isActive: framework.isActive !== false
    });
    setShowEditModal(true);
  };

  const exportFrameworks = async () => {
    try {
      const exportData = {
        frameworks,
        analytics: analyticsData,
        timestamp: new Date().toISOString(),
        filters: { searchTerm, filterBy, sortBy }
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `frameworks-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(t('frameworks.export.success'));
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(t('frameworks.export.failed'));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'draft': return Clock;
      case 'deprecated': return XCircle;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'draft': return 'text-yellow-500';
      case 'deprecated': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const filteredFrameworks = frameworks.filter(framework => {
    const matchesSearch = framework.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         framework.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || framework.status === filterBy;
    return matchesSearch && matchesFilter;
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
              {language === 'ar' ? 'إدارة الأطر التنظيمية' : 'Frameworks Management'}
            </h1>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'ar' 
                ? 'إدارة شاملة للأطر التنظيمية والامتثال' 
                : 'Comprehensive management of regulatory frameworks and compliance'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {filteredFrameworks.length} {language === 'ar' ? 'إطار' : 'frameworks'}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActionsToolbar
          actions={[
            { id: 'add', label: language === 'ar' ? 'إضافة إطار' : 'Add Framework', icon: 'plus', variant: 'primary', onClick: () => setShowCreateModal(true) },
            { id: 'import', label: language === 'ar' ? 'استيراد' : 'Import', icon: 'upload', variant: 'secondary' },
            { id: 'export', label: language === 'ar' ? 'تصدير' : 'Export', icon: 'download', variant: 'secondary' },
            { id: 'refresh', label: language === 'ar' ? 'تحديث' : 'Refresh', icon: 'refresh', variant: 'secondary' },
            { id: 'analytics', label: analyticsMode === 'standard' ? (language === 'ar' ? 'تحليلات متقدمة' : 'Advanced Analytics') : (language === 'ar' ? 'تحليلات أساسية' : 'Standard View'), icon: 'chart', variant: 'secondary' },
            { id: 'realtime', label: realTimeEnabled ? (language === 'ar' ? 'إيقاف الوقت الفعلي' : 'Disable Real-time') : (language === 'ar' ? 'تفعيل الوقت الفعلي' : 'Enable Real-time'), icon: 'pulse', variant: 'secondary' }
          ]}
          onAction={handleQuickAction}
          loading={loading}
        />

        {/* Analytics Dashboard */}
        <RoleDashboardCards
          data={{
            kpis: {
              totalFrameworks: { value: analyticsData.totalFrameworks || 0, trend: 'up', delta: '+2', status: 'info' },
              activeFrameworks: { value: analyticsData.activeFrameworks || 0, trend: 'up', delta: '+1', status: 'success' },
              compliance: { value: `${analyticsData.compliance || 0}%`, trend: 'up', delta: '+3%', status: 'success' },
              coverage: { value: `${analyticsData.coverage || 0}%`, trend: 'neutral', delta: '0%', status: 'warning' }
            }
          }}
          loading={loading}
        />

        {/* Advanced Analytics Panel */}
        {analyticsMode === 'advanced' && (
          <PermissionBasedCard
            requiredPermission="frameworks.view_analytics"
            title={language === 'ar' ? 'تحليلات متقدمة للأطر' : 'Advanced Framework Analytics'}
            subtitle={language === 'ar' ? 'رؤى شاملة لأداء الأطر التنظيمية' : 'Comprehensive insights into framework performance'}
          >
            <AdvancedAnalyticsPanel
              data={{
                trends: analyticsData.trends || [],
                distribution: analyticsData.distribution || [],
                heatmap: frameworks.map(f => ({
                  framework: f.name,
                  controls: f.controls_count || 0,
                  compliance: f.compliance_score || 0
                }))
              }}
              filters={{ searchTerm, filterBy, sortBy }}
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
                  placeholder={language === 'ar' ? 'البحث في الأطر...' : 'Search frameworks...'}
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
                <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
                <option value="draft">{language === 'ar' ? 'مسودة' : 'Draft'}</option>
                <option value="deprecated">{language === 'ar' ? 'مهجور' : 'Deprecated'}</option>
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
                <option value="name">{language === 'ar' ? 'الاسم' : 'Name'}</option>
                <option value="created_at">{language === 'ar' ? 'تاريخ الإنشاء' : 'Created Date'}</option>
                <option value="compliance">{language === 'ar' ? 'الامتثال' : 'Compliance'}</option>
                <option value="controls">{language === 'ar' ? 'الضوابط' : 'Controls'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Frameworks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFrameworks.map((framework) => {
            const StatusIcon = getStatusIcon(framework.status);
            return (
              <AnimatedCard
                key={framework.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                }`}
                // onClick={() => {
                //   setSelectedFramework(framework);
                //   fetchFrameworkDetails(framework.id);
                // }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {framework.name}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {framework.regulator || 'General Framework'}
                      </p>
                    </div>
                  </div>
                  <StatusIcon className={`w-5 h-5 ${getStatusColor(framework.status)}`} />
                </div>

                <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {framework.description || (language === 'ar' ? 'لا يوجد وصف متاح' : 'No description available')}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {framework.controls_count || 0}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {language === 'ar' ? 'ضابط' : 'Controls'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {framework.compliance_score || 0}%
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {language === 'ar' ? 'امتثال' : 'Compliance'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs mb-4">
                  <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                    {language === 'ar' ? 'آخر تحديث:' : 'Updated:'} {new Date(framework.updated_at || Date.now()).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                  <button
                    onClick={() => handleOpenEditModal(framework)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    {language === 'ar' ? 'تعديل' : 'Edit'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFramework(framework);
                      setShowDeleteModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {language === 'ar' ? 'حذف' : 'Delete'}
                  </button>
                </div>
              </AnimatedCard>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredFrameworks.length === 0 && !loading && (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              {language === 'ar' ? 'لا توجد أطر متاحة' : 'No Frameworks Available'}
            </h3>
            <p className="mb-4">
              {language === 'ar' 
                ? 'لم يتم العثور على أطر تنظيمية تطابق معايير البحث' 
                : 'No regulatory frameworks found matching your search criteria'
              }
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterBy('all');
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
            requiredPermission="frameworks.view_monitoring"
            title={language === 'ar' ? 'مراقبة الوقت الفعلي' : 'Real-time Monitoring'}
            subtitle={language === 'ar' ? 'تحديثات مباشرة لحالة الأطر التنظيمية' : 'Live updates on framework status and changes'}
          >
            <RealTimeMonitor
              data={{
                kpis: {
                  totalFrameworks: { value: analyticsData.totalFrameworks || 0, trend: 'up', delta: '+2', status: 'info' },
                  activeFrameworks: { value: analyticsData.activeFrameworks || 0, trend: 'up', delta: '+1', status: 'success' }
                },
                activityFeed: frameworks.slice(0, 5).map(f => ({
                  id: f.id,
                  user: 'System',
                  action: 'updated',
                  target: f.name,
                  time: new Date(f.updated_at || Date.now()).toLocaleTimeString(),
                  status: 'success'
                }))
              }}
              enabled={realTimeEnabled}
              loading={loading}
            />
          </PermissionBasedCard>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg p-6 w-full max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {language === 'ar' ? 'إنشاء إطار جديد' : 'Create New Framework'}
                </h2>
                <button onClick={() => { setShowCreateModal(false); resetForm(); }} className={`p-2 rounded hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateFramework}>
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {language === 'ar' ? 'الاسم' : 'Name'}
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md focus:border-blue-500 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {language === 'ar' ? 'الوصف' : 'Description'}
                  </label>
                  <textarea 
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md focus:border-blue-500 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {language === 'ar' ? 'الفئة' : 'Category'}
                  </label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md focus:border-blue-500 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div className="flex justify-end gap-4 mt-4">
                  <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className={`px-4 py-2 rounded ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}>
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                    {language === 'ar' ? 'إنشاء' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg p-6 w-full max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {language === 'ar' ? 'تعديل الإطار' : 'Edit Framework'}
                </h2>
                <button onClick={() => { setShowEditModal(false); resetForm(); }} className={`p-2 rounded hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEditFramework}>
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {language === 'ar' ? 'الاسم' : 'Name'}
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md focus:border-blue-500 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {language === 'ar' ? 'الوصف' : 'Description'}
                  </label>
                  <textarea 
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md focus:border-blue-500 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {language === 'ar' ? 'الفئة' : 'Category'}
                  </label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md focus:border-blue-500 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div className="flex justify-end gap-4 mt-4">
                  <button type="button" onClick={() => { setShowEditModal(false); resetForm(); }} className={`px-4 py-2 rounded ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}>
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                    {language === 'ar' ? 'تحديث' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg p-6 w-full max-w-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
              </h2>
              <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {language === 'ar' 
                  ? `هل أنت متأكد من حذف الإطار "${selectedFramework?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to delete the framework "${selectedFramework?.name}"? This action cannot be undone.`
                }
              </p>
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => { setShowDeleteModal(false); resetForm(); }} 
                  className={`px-4 py-2 rounded ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  onClick={handleDeleteFramework}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  {language === 'ar' ? 'حذف' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FrameworksManagementPage;
