import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, Bot, Zap, Target, Users, Settings, Search, Filter,
  Plus, Edit, Trash2, Play, Pause, CheckCircle, AlertTriangle, Info,
  BarChart3, TrendingUp, Activity, Brain, Workflow, Timer, Bell,
  RefreshCw, Eye, Download, Share2, MessageSquare, Star, ArrowRight
} from 'lucide-react';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner, AnimatedProgress } from '../../components/Animation/InteractiveAnimationToolkit';
import AIStatusPanel from '../../components/ai/AIStatusPanel';
import apiService from '../../services/apiEndpoints';
import { useI18n } from '../../hooks/useI18n';

const AISchedulerPage = () => {
  const { t, language, isRTL } = useI18n();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [automationRules, setAutomationRules] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState(null);

  // AI Scheduler statistics
  const [schedulerStats, setSchedulerStats] = useState({
    totalTasks: 158,
    activeTasks: 42,
    completedToday: 18,
    aiSuggestions: 7,
    automationRate: 78.5,
    avgCompletionTime: '2.3 hours'
  });

  const loadSchedulerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksRes, rulesRes, suggestionsRes, analyticsRes] = await Promise.all([
        apiService.scheduler.getJobs({ status: 'all', limit: 50 }),
        apiService.scheduler.getRuns({ limit: 20 }),
        apiService.rag.ask('What are the recommended automation improvements for our GRC processes?', { context: 'scheduler' }),
        apiService.scheduler.getJobs({ analytics: true })
      ]);

      // Process tasks data
      const tasksData = tasksRes.data || tasksRes || [];
      const processedTasks = tasksData.map(task => ({
        id: task.id,
        title: {
          en: task.name || task.title,
          ar: task.name_ar || task.title_ar || task.name || task.title
        },
        description: {
          en: task.description || 'Automated GRC task',
          ar: task.description_ar || task.description || 'مهمة حوكمة آلية'
        },
        type: task.type || 'assessment',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        schedule: task.schedule || task.cron_expression,
        nextRun: task.next_run || task.next_execution,
        lastRun: task.last_run || task.last_execution,
        createdBy: task.created_by || 'System',
        framework: task.framework || 'General'
      }));

      setTasks(processedTasks);

      // Process automation rules
      const rulesData = rulesRes.data || rulesRes || [];
      const processedRules = rulesData.map(rule => ({
        id: rule.id,
        name: {
          en: rule.name || 'Automation Rule',
          ar: rule.name_ar || rule.name || 'قاعدة الأتمتة'
        },
        description: {
          en: rule.description || 'Automated rule',
          ar: rule.description_ar || rule.description || 'قاعدة آلية'
        },
        trigger: rule.trigger || 'schedule',
        action: rule.action || 'execute',
        status: rule.status || 'active',
        conditions: rule.conditions || [],
        lastTriggered: rule.last_triggered
      }));

      setAutomationRules(processedRules);

      // Process AI suggestions
      const suggestionsData = suggestionsRes.data || suggestionsRes || {};
      const processedSuggestions = [
        {
          id: 'suggestion-001',
          type: 'optimization',
          title: {
            en: 'Optimize Assessment Scheduling',
            ar: 'تحسين جدولة التقييمات'
          },
          description: {
            en: suggestionsData.answer || 'AI-powered scheduling optimization recommendations',
            ar: 'توصيات تحسين الجدولة المدعومة بالذكاء الاصطناعي'
          },
          impact: 'high',
          effort: 'medium',
          confidence: suggestionsData.confidence || 0.85
        }
      ];

      setAiSuggestions(processedSuggestions);

      // Update statistics
      setSchedulerStats({
        totalTasks: processedTasks.length,
        activeTasks: processedTasks.filter(t => t.status === 'active').length,
        completedToday: processedTasks.filter(t => {
          const today = new Date().toDateString();
          return t.lastRun && new Date(t.lastRun).toDateString() === today;
        }).length,
        successRate: Math.round((processedTasks.filter(t => t.status === 'completed').length / processedTasks.length) * 100) || 0
      });

    } catch (error) {
      console.error('Error loading scheduler data:', error);
      setError(error.message || 'Failed to load scheduler data');
      
      // Set empty data instead of mock data
      setTasks([]);
      setAutomationRules([]);
      setAiSuggestions([]);
      setSchedulerStats({
        totalTasks: 0,
        activeTasks: 0,
        completedToday: 0,
        successRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedulerData();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      running: 'text-green-600 bg-green-50 border-green-200',
      scheduled: 'text-blue-600 bg-blue-50 border-blue-200',
      completed: 'text-gray-600 bg-gray-50 border-gray-200',
      paused: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      failed: 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || colors.scheduled;
  };

  // Task creation handler
  const createTask = async (taskData) => {
    try {
      await apiService.scheduler.createJob({
        name: taskData.title,
        description: taskData.description,
        type: taskData.type,
        schedule: taskData.schedule,
        priority: taskData.priority,
        framework: taskData.framework
      });
      loadSchedulerData(); // Refresh data
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'text-red-600 bg-red-50 border-red-200',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200'
    };
    return colors[priority] || colors.medium;
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filterBy === 'all' || task.type === filterBy || task.status === filterBy;
    const matchesSearch = !searchTerm ||
      task.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.title.ar.includes(searchTerm) ||
      task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderDashboardTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <AnimatedCard className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                <ArabicTextEngine
                  text={language === 'ar' ? 'إجمالي المهام' : 'Total Tasks'}
                  language={language}
                />
              </p>
              <p className="text-2xl font-bold text-gray-900">{schedulerStats.totalTasks}</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                <ArabicTextEngine
                  text={language === 'ar' ? 'المهام النشطة' : 'Active Tasks'}
                  language={language}
                />
              </p>
              <p className="text-2xl font-bold text-green-600">{schedulerStats.activeTasks}</p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                <ArabicTextEngine
                  text={language === 'ar' ? 'المكتمل اليوم' : 'Completed Today'}
                  language={language}
                />
              </p>
              <p className="text-2xl font-bold text-blue-600">{schedulerStats.completedToday}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-500" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                <ArabicTextEngine
                  text={language === 'ar' ? 'اقتراحات الذكاء الاصطناعي' : 'AI Suggestions'}
                  language={language}
                />
              </p>
              <p className="text-2xl font-bold text-purple-600">{schedulerStats.aiSuggestions}</p>
            </div>
            <Brain className="h-8 w-8 text-purple-500" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                <ArabicTextEngine
                  text={language === 'ar' ? 'معدل الأتمتة' : 'Automation Rate'}
                  language={language}
                />
              </p>
              <p className="text-2xl font-bold text-indigo-600">{schedulerStats.automationRate}%</p>
            </div>
            <Bot className="h-8 w-8 text-indigo-500" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                <ArabicTextEngine
                  text={language === 'ar' ? 'متوسط وقت الإنجاز' : 'Avg Completion'}
                  language={language}
                />
              </p>
              <p className="text-sm font-medium text-gray-900">{schedulerStats.avgCompletionTime}</p>
            </div>
            <Timer className="h-8 w-8 text-gray-500" />
          </div>
        </AnimatedCard>
      </div>

      {/* Quick Actions and AI Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <AnimatedCard className="p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <ArabicTextEngine text={language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'} language={language} />
          </h3>
          <div className="space-y-3">
            <AnimatedButton
              onClick={() => setShowCreateTask(true)}
              className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-blue-600" />
                <span className="font-medium">
                  <ArabicTextEngine text={language === 'ar' ? 'إنشاء مهمة جديدة' : 'Create New Task'} language={language} />
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </AnimatedButton>
            <AnimatedButton className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Workflow className="h-5 w-5 text-green-600" />
                <span className="font-medium">
                  <ArabicTextEngine text={language === 'ar' ? 'إنشاء قاعدة أتمتة' : 'Create Automation Rule'} language={language} />
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </AnimatedButton>
            <AnimatedButton className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="font-medium">
                  <ArabicTextEngine text={language === 'ar' ? 'جدولة ذكية' : 'Smart Scheduling'} language={language} />
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </AnimatedButton>
          </div>
        </AnimatedCard>

        {/* AI Suggestions Preview */}
        <AnimatedCard className="p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <ArabicTextEngine text={language === 'ar' ? 'اقتراحات الذكاء الاصطناعي' : 'AI Suggestions'} language={language} />
          </h3>
          <div className="space-y-3">
            {aiSuggestions.slice(0, 3).map((suggestion) => (
              <div key={suggestion.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <ArabicTextEngine text={suggestion.title[language]} language={language} />
                  </h4>
                  <div className={`px-2 py-1 text-xs font-medium rounded ${
                    suggestion.status === 'implemented' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {suggestion.confidence}%
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <ArabicTextEngine text={suggestion.description[language]} language={language} />
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600 font-medium">{suggestion.estimatedBenefit}</span>
                  <button className="text-xs text-blue-600 hover:text-blue-800">
                    <ArabicTextEngine text={language === 'ar' ? 'عرض التفاصيل' : 'View Details'} language={language} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>
      </div>
    </div>
  );

  const renderTasksTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث في المهام...' : 'Search tasks...'}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="all">{language === 'ar' ? 'جميع المهام' : 'All Tasks'}</option>
            <option value="automated">{language === 'ar' ? 'آلية' : 'Automated'}</option>
            <option value="ai-enhanced">{language === 'ar' ? 'محسنة بالذكاء الاصطناعي' : 'AI-Enhanced'}</option>
            <option value="manual">{language === 'ar' ? 'يدوية' : 'Manual'}</option>
          </select>
          <AnimatedButton
            onClick={() => setShowCreateTask(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <ArabicTextEngine text={language === 'ar' ? 'مهمة جديدة' : 'New Task'} language={language} />
          </AnimatedButton>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            <ArabicTextEngine text={language === 'ar' ? 'المهام المجدولة' : 'Scheduled Tasks'} language={language} />
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredTasks.map((task) => (
            <AnimatedCard key={task.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </div>
                    <div className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(task.status)}`}>
                      {task.status.toUpperCase()}
                    </div>
                    <div className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">
                      {task.type.toUpperCase()}
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <ArabicTextEngine text={task.title[language]} language={language} />
                  </h4>
                  <p className="text-sm text-gray-600 mb-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <ArabicTextEngine text={task.description[language]} language={language} />
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">
                        <ArabicTextEngine text={language === 'ar' ? 'المسؤول:' : 'Assigned:'} language={language} />
                      </span>
                      <br />
                      {task.assignedTo}
                    </div>
                    <div>
                      <span className="font-medium">
                        <ArabicTextEngine text={language === 'ar' ? 'القسم:' : 'Department:'} language={language} />
                      </span>
                      <br />
                      {task.department}
                    </div>
                    <div>
                      <span className="font-medium">
                        <ArabicTextEngine text={language === 'ar' ? 'المدة المتوقعة:' : 'Duration:'} language={language} />
                      </span>
                      <br />
                      {task.estimatedDuration}
                    </div>
                    <div>
                      <span className="font-medium">
                        <ArabicTextEngine text={language === 'ar' ? 'الموعد:' : 'Scheduled:'} language={language} />
                      </span>
                      <br />
                      {new Date(task.scheduledTime).toLocaleDateString()}
                    </div>
                  </div>
                  {task.status === 'running' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>
                          <ArabicTextEngine text={language === 'ar' ? 'التقدم' : 'Progress'} language={language} />
                        </span>
                        <span>{task.progress}%</span>
                      </div>
                      <AnimatedProgress value={task.progress} className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${task.progress}%` }}
                        />
                      </AnimatedProgress>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  {task.status === 'running' ? (
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Pause className="h-4 w-4" />
                    </button>
                  ) : task.status === 'scheduled' ? (
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Play className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAutomationTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            <ArabicTextEngine text={language === 'ar' ? 'قواعد الأتمتة' : 'Automation Rules'} language={language} />
          </h3>
          <AnimatedButton className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <ArabicTextEngine text={language === 'ar' ? 'إضافة قاعدة' : 'Add Rule'} language={language} />
          </AnimatedButton>
        </div>
        <div className="space-y-4">
          {automationRules.map((rule) => (
            <AnimatedCard key={rule.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <ArabicTextEngine text={rule.name[language]} language={language} />
                    </h4>
                    <div className={`px-2 py-1 text-xs font-medium rounded-md ${
                      rule.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rule.status.toUpperCase()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <ArabicTextEngine text={rule.description[language]} language={language} />
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">
                        <ArabicTextEngine text={language === 'ar' ? 'المشغل:' : 'Trigger:'} language={language} />
                      </span>
                      <br />
                      {rule.trigger}
                    </div>
                    <div>
                      <span className="font-medium">
                        <ArabicTextEngine text={language === 'ar' ? 'التكرار:' : 'Frequency:'} language={language} />
                      </span>
                      <br />
                      {rule.frequency}
                    </div>
                    <div>
                      <span className="font-medium">
                        <ArabicTextEngine text={language === 'ar' ? 'معدل النجاح:' : 'Success Rate:'} language={language} />
                      </span>
                      <br />
                      <span className="text-green-600 font-semibold">{rule.successRate}%</span>
                    </div>
                    <div>
                      <span className="font-medium">
                        <ArabicTextEngine text={language === 'ar' ? 'التشغيل القادم:' : 'Next Run:'} language={language} />
                      </span>
                      <br />
                      {rule.nextRun === 'Paused' ? 'Paused' : new Date(rule.nextRun).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    {rule.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAITab = () => (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <ArabicTextEngine text={language === 'ar' ? 'اقتراحات الذكاء الاصطناعي' : 'AI-Powered Suggestions'} language={language} />
        </h3>
        <div className="space-y-4">
          {aiSuggestions.map((suggestion) => (
            <AnimatedCard key={suggestion.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-1 rounded-full ${
                      suggestion.type === 'optimization' ? 'bg-blue-100' :
                      suggestion.type === 'automation' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      {suggestion.type === 'optimization' ? (
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      ) : suggestion.type === 'automation' ? (
                        <Bot className="h-4 w-4 text-green-600" />
                      ) : (
                        <Brain className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <ArabicTextEngine text={suggestion.title[language]} language={language} />
                    </h4>
                    <div className={`px-2 py-1 text-xs font-medium rounded-md ${
                      suggestion.status === 'implemented' ? 'bg-green-100 text-green-800' :
                      suggestion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {suggestion.status.toUpperCase()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <ArabicTextEngine text={suggestion.description[language]} language={language} />
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">
                        <ArabicTextEngine text={language === 'ar' ? 'الثقة:' : 'Confidence:'} language={language} />
                      </span>
                      <span className="text-blue-600 font-semibold">{suggestion.confidence}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium">
                        <ArabicTextEngine text={language === 'ar' ? 'المنفعة المتوقعة:' : 'Expected Benefit:'} language={language} />
                      </span>
                      <span className="text-green-600 font-semibold">{suggestion.estimatedBenefit}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {suggestion.status === 'pending' && (
                    <>
                      <AnimatedButton className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
                        <ArabicTextEngine text={language === 'ar' ? 'تطبيق' : 'Implement'} language={language} />
                      </AnimatedButton>
                      <AnimatedButton className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">
                        <ArabicTextEngine text={language === 'ar' ? 'رفض' : 'Dismiss'} language={language} />
                      </AnimatedButton>
                    </>
                  )}
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard className="p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <ArabicTextEngine text={language === 'ar' ? 'كفاءة المهام' : 'Task Efficiency'} language={language} />
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p><ArabicTextEngine text={language === 'ar' ? 'مخطط كفاءة المهام' : 'Task Efficiency Chart'} language={language} /></p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <ArabicTextEngine text={language === 'ar' ? 'اتجاهات الأتمتة' : 'Automation Trends'} language={language} />
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2" />
              <p><ArabicTextEngine text={language === 'ar' ? 'مخطط اتجاهات الأتمتة' : 'Automation Trends Chart'} language={language} /></p>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: language === 'ar' ? 'لوحة المعلومات' : 'Dashboard', icon: BarChart3 },
    { id: 'tasks', label: language === 'ar' ? 'المهام' : 'Tasks', icon: Target },
    { id: 'automation', label: language === 'ar' ? 'الأتمتة' : 'Automation', icon: Bot },
    { id: 'ai', label: language === 'ar' ? 'الذكاء الاصطناعي' : 'AI Suggestions', icon: Brain },
    { id: 'analytics', label: language === 'ar' ? 'التحليلات' : 'Analytics', icon: Activity }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CulturalLoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Status Panel */}
        <div className="mb-6">
          <AIStatusPanel />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <ArabicTextEngine text={language === 'ar' ? 'الجدولة الذكية وأتمتة المهام' : 'AI Scheduler & Task Automation'} language={language} />
              </h1>
              <p className="text-gray-600 mt-2">
                <ArabicTextEngine
                  text={language === 'ar' ? 'إدارة المهام الذكية والأتمتة المدعومة بالذكاء الاصطناعي' : 'Smart task management with AI-powered automation'}
                  language={language}
                />
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                <Bot className="h-4 w-4" />
                {language === 'en' ? 'العربية' : 'English'}
              </button>
              <AnimatedButton
                onClick={loadSchedulerData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <ArabicTextEngine text={language === 'ar' ? 'تحديث' : 'Refresh'} language={language} />
              </AnimatedButton>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200 rounded-t-lg">
          <nav className="flex space-x-8 px-6" dir="ltr">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <ArabicTextEngine text={tab.label} language={language} />
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg min-h-[600px] p-6">
          {activeTab === 'dashboard' && renderDashboardTab()}
          {activeTab === 'tasks' && renderTasksTab()}
          {activeTab === 'automation' && renderAutomationTab()}
          {activeTab === 'ai' && renderAITab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </div>
      </div>
    </div>
  );
};

export default AISchedulerPage;
