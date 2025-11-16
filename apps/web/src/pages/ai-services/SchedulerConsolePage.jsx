import React, { useState, useEffect } from 'react';
import {
  Play, Pause, Square, RefreshCw, Clock, CheckCircle, XCircle,
  Plus, Search, Calendar, User, Settings, BarChart3, Activity,
  Zap, Database, FileText, Target, TrendingUp, Eye, Edit, Trash2
} from 'lucide-react';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner } from '../../components/Animation/InteractiveAnimationToolkit';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';
import { useI18n } from '../../hooks/useI18n';

const SchedulerConsolePage = () => {
  const { language, changeLanguage } = useI18n();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs');

  // Scheduler statistics
  const [schedulerStats, setSchedulerStats] = useState({
    totalJobs: 0,
    runningJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    queueDepth: 0,
    avgExecutionTime: '0s',
    successRate: '0%',
    nextScheduledJob: 'None'
  });

  // Job form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'assessment',
    schedule: '0 0 * * *', // Daily at midnight
    enabled: true,
    parameters: {}
  });

  useEffect(() => {
    loadJobs();
    loadSchedulerStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadJobs();
      loadSchedulerStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [searchTerm, filterBy, loadJobs, loadSchedulerStats]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await apiService.scheduler.getAll({
        search: searchTerm,
        status: filterBy !== 'all' ? filterBy : undefined
      });
      const jobsData = response.data || response || [];
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error(language === 'ar' ? 'فشل تحميل المهام' : 'Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedulerStats = async () => {
    try {
      const response = await apiService.scheduler.getStats();
      if (response?.data) {
        setSchedulerStats(response.data);
      }
    } catch (error) {
      console.error('Error loading scheduler stats:', error);
    }
  };

  // Job Operations
  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.scheduler.create(formData);
      if (response.data?.success || response.success) {
        toast.success(language === 'ar' ? 'تم إنشاء المهمة بنجاح!' : 'Job created successfully!');
        setShowCreateModal(false);
        resetForm();
        loadJobs();
        loadSchedulerStats();
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error(language === 'ar' ? 'فشل إنشاء المهمة' : 'Failed to create job');
    }
  };

  const handleRunJob = async (jobId) => {
    try {
      const response = await apiService.scheduler.run(jobId);
      if (response.data?.success || response.success) {
        toast.success(language === 'ar' ? 'تم تشغيل المهمة!' : 'Job started successfully!');
        loadJobs();
        loadSchedulerStats();
      }
    } catch (error) {
      console.error('Error running job:', error);
      toast.error(language === 'ar' ? 'فشل تشغيل المهمة' : 'Failed to run job');
    }
  };

  const handlePauseJob = async (jobId) => {
    try {
      const response = await apiService.scheduler.pause(jobId);
      if (response.data?.success || response.success) {
        toast.success(language === 'ar' ? 'تم إيقاف المهمة!' : 'Job paused successfully!');
        loadJobs();
        loadSchedulerStats();
      }
    } catch (error) {
      console.error('Error pausing job:', error);
      toast.error(language === 'ar' ? 'فشل إيقاف المهمة' : 'Failed to pause job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const response = await apiService.scheduler.delete(jobId);
      if (response.data?.success || response.success) {
        toast.success(language === 'ar' ? 'تم حذف المهمة!' : 'Job deleted successfully!');
        loadJobs();
        loadSchedulerStats();
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(language === 'ar' ? 'فشل حذف المهمة' : 'Failed to delete job');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'assessment',
      schedule: '0 0 * * *',
      enabled: true,
      parameters: {}
    });
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'running':
        return <Play className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'queued':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Square className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'queued':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getJobTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'assessment':
        return <Target className="h-4 w-4" />;
      case 'import':
        return <Database className="h-4 w-4" />;
      case 'report':
        return <FileText className="h-4 w-4" />;
      case 'sync':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const tabs = [
    { id: 'jobs', name: 'المهام', nameEn: 'Jobs', icon: Activity },
    { id: 'queue', name: 'الطابور', nameEn: 'Queue', icon: Clock },
    { id: 'history', name: 'التاريخ', nameEn: 'History', icon: BarChart3 },
    { id: 'settings', name: 'الإعدادات', nameEn: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <CulturalLoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <ArabicTextEngine
            personalityType="professional"
            style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af' }}
          >
            {language === 'ar' ? 'وحدة تحكم الجدولة الذكية' : 'AI Scheduler Console'}
          </ArabicTextEngine>
          <ArabicTextEngine
            personalityType="casual"
            style={{ fontSize: '16px', color: '#6b7280', marginTop: '8px' }}
          >
            {language === 'ar' ? 'إدارة المهام المجدولة والعمليات التلقائية' : 'Manage scheduled jobs and automated processes'}
          </ArabicTextEngine>
        </div>

        <div className="flex gap-3">
          <AnimatedButton
            variant="secondary"
            onClick={() => changeLanguage(language === 'ar' ? 'en' : 'ar')}
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </AnimatedButton>

          <AnimatedButton
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'إنشاء مهمة جديدة' : 'Create New Job'}
          </AnimatedButton>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{schedulerStats.totalJobs}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'إجمالي المهام' : 'Total Jobs'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{schedulerStats.runningJobs}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'مهام قيد التشغيل' : 'Running Jobs'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{schedulerStats.queueDepth}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'عمق الطابور' : 'Queue Depth'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{schedulerStats.successRate}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'معدل النجاح' : 'Success Rate'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              {language === 'ar' ? tab.name : tab.nameEn}
            </span>
          </button>
        ))}
      </div>

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <AnimatedCard hover3D={false} culturalPattern={true}>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={language === 'ar' ? 'البحث في المهام...' : 'Search jobs...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                    <option value="running">{language === 'ar' ? 'قيد التشغيل' : 'Running'}</option>
                    <option value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</option>
                    <option value="failed">{language === 'ar' ? 'فاشل' : 'Failed'}</option>
                    <option value="paused">{language === 'ar' ? 'متوقف' : 'Paused'}</option>
                  </select>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Jobs List */}
          <div className="space-y-4">
            {jobs.map((job) => (
              <AnimatedCard key={job.id} hover3D={true} culturalPattern={true}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getJobTypeIcon(job.type)}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {job.name}
                        </h3>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                        {job.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getStatusIcon(job.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {language === 'ar' ? 'الجدولة:' : 'Schedule:'} {job.schedule || 'Manual'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {language === 'ar' ? 'آخر تشغيل:' : 'Last Run:'} {job.lastRun || 'Never'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {language === 'ar' ? 'المنشئ:' : 'Created by:'} {job.createdBy || 'System'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex space-x-2">
                      <AnimatedButton variant="ghost" size="sm" onClick={() => setSelectedJob(job)}>
                        <Eye className="h-4 w-4" />
                      </AnimatedButton>
                      <AnimatedButton variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </AnimatedButton>
                      <AnimatedButton variant="ghost" size="sm" onClick={() => handleDeleteJob(job.id)}>
                        <Trash2 className="h-4 w-4" />
                      </AnimatedButton>
                    </div>
                    <div className="flex space-x-2">
                      {job.status !== 'running' && (
                        <AnimatedButton 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleRunJob(job.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          {language === 'ar' ? 'تشغيل' : 'Run'}
                        </AnimatedButton>
                      )}
                      {job.status === 'running' && (
                        <AnimatedButton 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handlePauseJob(job.id)}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          {language === 'ar' ? 'إيقاف' : 'Pause'}
                        </AnimatedButton>
                      )}
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>

          {jobs.length === 0 && !loading && (
            <AnimatedCard hover3D={false} culturalPattern={true}>
              <div className="p-12 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'ar' ? 'لا توجد مهام مجدولة' : 'No scheduled jobs found'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'ar' ? 'ابدأ بإنشاء مهمة جديدة لأتمتة العمليات' : 'Start by creating a new job to automate processes'}
                </p>
                <AnimatedButton
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'إنشاء مهمة جديدة' : 'Create New Job'}
                </AnimatedButton>
              </div>
            </AnimatedCard>
          )}
        </div>
      )}
    </div>
  );
};

export default SchedulerConsolePage;
