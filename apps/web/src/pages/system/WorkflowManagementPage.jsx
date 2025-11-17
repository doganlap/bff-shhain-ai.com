import React, { useState, useEffect, useCallback } from 'react';
import {
  Play, CheckCircle, Clock, Users, Settings, Search,
  Eye, Trash2, Plus, ArrowRight, User, Calendar, FileText,
  BarChart3, Workflow, AlertCircle, Activity, Target, HelpCircle, Zap
} from 'lucide-react';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner, AnimatedProgress } from '../../components/Animation/InteractiveAnimationToolkit';
import apiService from '../../services/apiEndpoints';
import { useI18n } from '../../hooks/useI18n';

const WorkflowManagementPage = () => {
  const { language, changeLanguage } = useI18n();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('workflows');
  
  const [editableTemplates, setEditableTemplates] = useState([]);
  const [showGuidanceToolkit, setShowGuidanceToolkit] = useState(false);
  
  const [guidanceTab, setGuidanceTab] = useState('getting-started');
  
  const [defaultApprovalTimeoutDays, setDefaultApprovalTimeoutDays] = useState(3);
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [automationRules, setAutomationRules] = useState({ autoApproveLowPriority: false });

  // Real workflow statistics
  const [workflowStats, setWorkflowStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    completedToday: 0,
    avgCompletionTime: '0 days',
    approvalPending: 0,
    overdue: 0
  });

  useEffect(() => {
    loadWorkflows();
    loadWorkflowStats();
    loadWorkflowTemplates();
  }, [filterBy, searchTerm, loadWorkflows, loadWorkflowTemplates, loadWorkflowStats]);

  const loadWorkflowTemplates = useCallback(async () => {
    try {
      const response = await apiService.workflows.getTemplates();
      const templatesData = response.data || response || [];
      
      setEditableTemplates(templatesData.map(t => ({
        ...t,
        steps: (t.steps || []).map(s => (
          typeof s === 'string'
            ? { 
                label: s, slaDays: defaultApprovalTimeoutDays, escalationTo: '',
                rules: { conditions: { riskScoreThreshold: 0, dueDateDays: 0, assigneeRole: '' }, actions: { reassignTo: '', notifyChannels: [], pause: false } }
              }
            : {
                label: s.label || s.name || 'Step',
                slaDays: s.slaDays ?? defaultApprovalTimeoutDays,
                escalationTo: s.escalationTo ?? '',
                rules: {
                  conditions: {
                    riskScoreThreshold: s.rules?.conditions?.riskScoreThreshold ?? 0,
                    dueDateDays: s.rules?.conditions?.dueDateDays ?? 0,
                    assigneeRole: s.rules?.conditions?.assigneeRole ?? ''
                  },
                  actions: {
                    reassignTo: s.rules?.actions?.reassignTo ?? '',
                    notifyChannels: s.rules?.actions?.notifyChannels ?? [],
                    pause: s.rules?.actions?.pause ?? false
                  }
                }
              }
        ))
      })));
    } catch (error) {
      console.error('Error loading workflow templates:', error);
      // Set default templates if API fails
      const fallback = [
        {
          id: 1,
          name: 'Assessment Workflow',
          nameAr: 'سير عمل التقييم',
          description: 'Standard assessment approval workflow',
          descriptionAr: 'سير عمل موافقة التقييم القياسي',
          category: 'Assessment',
          estimatedDuration: '5-7 days',
          steps: ['Initial Review', 'Technical Assessment', 'Manager Approval', 'Final Sign-off']
        },
        {
          id: 2,
          name: 'Risk Management Workflow',
          nameAr: 'سير عمل إدارة المخاطر',
          description: 'Risk identification and mitigation workflow',
          descriptionAr: 'سير عمل تحديد وتخفيف المخاطر',
          category: 'Risk',
          estimatedDuration: '3-5 days',
          steps: ['Risk Identification', 'Impact Analysis', 'Mitigation Planning', 'Implementation']
        }
      ];
      
      setEditableTemplates(fallback.map(t => ({
        ...t,
        steps: t.steps.map(s => ({ 
          label: s, slaDays: defaultApprovalTimeoutDays, escalationTo: '',
          rules: { conditions: { riskScoreThreshold: 0, dueDateDays: 0, assigneeRole: '' }, actions: { reassignTo: '', notifyChannels: [], pause: false } }
        }))
      })));
    }
  }, [defaultApprovalTimeoutDays]);

  const saveTemplateSLA = async (templateId) => {
    try {
      const template = editableTemplates.find(t => t.id === templateId);
      if (!template) return;
      const payloadSteps = template.steps.map(s => ({
        label: s.label,
        slaDays: s.slaDays,
        escalationTo: s.escalationTo,
        rules: s.rules
      }));
      const response = await apiService.workflows.updateTemplate(templateId, { steps: payloadSteps });
      if (response?.data) {
        alert(language === 'ar' ? 'تم حفظ إعدادات SLA بنجاح' : 'SLA settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving template SLA:', error);
      alert(language === 'ar' ? 'فشل حفظ إعدادات SLA' : 'Failed to save SLA settings');
    }
  };

  const loadWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.workflows.getAll({ 
        status: filterBy === 'all' ? undefined : filterBy,
        search: searchTerm
      });
      const workflowsData = response.data || response || [];
      
      // Process workflows data with safe defaults
      const processedWorkflows = workflowsData.map((workflow, index) => ({
        id: workflow.id || `workflow-fallback-${index}-${Date.now()}`,
        name: workflow.name || 'Unnamed Workflow',
        nameAr: workflow.nameAr || 'سير عمل غير مسمى',
        description: workflow.description || 'No description available',
        status: workflow.status || 'active',
        type: workflow.type || 'assessment',
        priority: workflow.priority || 'medium',
        created_by: workflow.created_by || 'System',
        created_at: workflow.created_at || new Date().toISOString(),
        assignedTo: workflow.assignedTo || 'Unassigned',
        dueDate: workflow.dueDate || 'No due date',
        participants: workflow.participants || 0,
        completedSteps: workflow.completedSteps || 0,
        steps: workflow.steps || 3,
        progress: workflow.progress || 0,
        approvals: workflow.approvals || [
          { step: 'Initial Review', assignee: 'Manager', status: 'pending' },
          { step: 'Final Approval', assignee: 'Director', status: 'pending' }
        ],
        instances: workflow.instances || []
      }));
      
      setWorkflows(processedWorkflows);
    } catch (error) {
      console.error('Error loading workflows:', error);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, [filterBy, searchTerm]);

  const loadWorkflowStats = useCallback(async () => {
    try {
      const response = await apiService.workflows.getStats();
      if (response?.data) {
        setWorkflowStats(response.data);
      }
    } catch (error) {
      console.error('Error loading workflow stats:', error);
    }
  }, []);

  // Create new workflow
  

  // Update workflow status
  const handleUpdateWorkflowStatus = useCallback(async (id, status) => {
    try {
      await apiService.workflows.update(id, { status });
      loadWorkflows();
      loadWorkflowStats();
    } catch (error) {
      console.error('Error updating workflow status:', error);
    }
  }, [loadWorkflows, loadWorkflowStats]);

  const handleDeleteWorkflow = useCallback(async (id) => {
    try {
      await apiService.workflows.delete(id);
      loadWorkflows();
      loadWorkflowStats();
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  }, [loadWorkflows, loadWorkflowStats]);

  const approveStep = useCallback(async (workflowId, index) => {
    try {
      setWorkflows(prev => prev.map(w => {
        if (w.id !== workflowId) return w;
        const approvals = [...w.approvals];
        approvals[index] = { ...approvals[index], status: 'completed', completedAt: new Date().toISOString() };
        return { ...w, approvals };
      }));
      await apiService.workflows.update(workflowId, { action: 'approve_step', stepIndex: index });
    } catch (error) {
      console.error('Error approving step:', error);
    }
  }, []);

  const escalateWorkflow = useCallback(async (workflowId) => {
    try {
      await handleUpdateWorkflowStatus(workflowId, 'overdue');
    } catch (error) {
      console.error('Error escalating workflow:', error);
    }
  }, [handleUpdateWorkflowStatus]);

  useEffect(() => {
    if (!automationEnabled) return;
    const interval = setInterval(() => {
      try {
        workflows.forEach(w => {
          const started = new Date(w.created_at);
          const slaMs = defaultApprovalTimeoutDays * 24 * 60 * 60 * 1000;
          const hasOverdue = (w.approvals || []).some(a => a.status !== 'completed' && (Date.now() - started.getTime() > slaMs));
          if (hasOverdue && w.status !== 'overdue') {
            escalateWorkflow(w.id);
          }
          if (automationRules.autoApproveLowPriority && String(w.priority).toLowerCase() === 'low') {
            (w.approvals || []).forEach((a, idx) => {
              if (a.status !== 'completed') approveStep(w.id, idx);
            });
          }
        });
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [automationEnabled, workflows, defaultApprovalTimeoutDays, automationRules, escalateWorkflow, approveStep]);


  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4 text-blue-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  const tabs = [
    { id: 'workflows', name: 'سير العمل', nameEn: 'Workflows', icon: Workflow },
    { id: 'instances', name: 'المثيلات', nameEn: 'Instances', icon: Activity },
    { id: 'templates', name: 'القوالب', nameEn: 'Templates', icon: FileText },
    { id: 'analytics', name: 'التحليلات', nameEn: 'Analytics', icon: BarChart3 },
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
            {language === 'ar' ? 'إدارة سير العمل' : 'Workflow Management'}
          </ArabicTextEngine>
          <ArabicTextEngine
            personalityType="casual"
            style={{ fontSize: '16px', color: '#6b7280', marginTop: '8px' }}
          >
            {language === 'ar' ? 'إدارة وتتبع سير العمل والموافقات التلقائية' : 'Manage and track automated workflows and approval chains'}
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
          variant="ghost"
          onClick={() => setShowGuidanceToolkit(v => !v)}
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'دليل الاستخدام' : 'Guidance'}
        </AnimatedButton>
      </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Workflow className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{workflowStats.totalWorkflows}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'إجمالي سير العمل' : 'Total Workflows'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{workflowStats.activeWorkflows}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'سير العمل النشط' : 'Active Workflows'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{workflowStats.completedToday}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'مكتمل اليوم' : 'Completed Today'}
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
                <p className="text-2xl font-bold text-gray-900">{workflowStats.avgCompletionTime}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'متوسط وقت الإنجاز' : 'Avg Completion Time'}
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

      {/* Workflows Tab */}
      {activeTab === 'workflows' && (
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
                      placeholder={language === 'ar' ? 'البحث في سير العمل...' : 'Search workflows...'}
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
                    <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
                    <option value="pending">{language === 'ar' ? 'معلق' : 'Pending'}</option>
                    <option value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</option>
                  </select>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Workflows List */}
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <AnimatedCard key={workflow.id} hover3D={true} culturalPattern={true}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(workflow.status)}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {language === 'ar' ? workflow.nameAr : workflow.name}
                        </h3>
                      </div>

                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(workflow.priority)}`}>
                        {workflow.priority.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <AnimatedButton variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </AnimatedButton>
                      
                      <AnimatedButton variant="ghost" size="sm" onClick={() => handleUpdateWorkflowStatus(workflow.id, 'completed')}>
                        <CheckCircle className="h-4 w-4" />
                      </AnimatedButton>
                      <AnimatedButton variant="ghost" size="sm" onClick={() => {
                        workflow.approvals.forEach((a, idx) => {
                          if (a.status !== 'completed') approveStep(workflow.id, idx);
                        });
                      }}>
                        <Zap className="h-4 w-4" />
                      </AnimatedButton>
                      <AnimatedButton variant="ghost" size="sm" onClick={() => handleDeleteWorkflow(workflow.id)}>
                        <Trash2 className="h-4 w-4" />
                      </AnimatedButton>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{workflow.assignedTo}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{workflow.dueDate}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{workflow.participants} participants</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        {language === 'ar' ? 'التقدم' : 'Progress'}: {workflow.completedSteps}/{workflow.steps} {language === 'ar' ? 'خطوة' : 'steps'}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{workflow.progress}%</span>
                    </div>
                    <AnimatedProgress value={workflow.progress} max={100} className="h-2" />
                  </div>

                  {/* Approval Chain */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      {language === 'ar' ? 'سلسلة الموافقة' : 'Approval Chain'}
                    </h4>
                    <div className="flex items-center space-x-2 overflow-x-auto">
                      {workflow.approvals.map((approval, index) => {
                        const started = new Date(workflow.created_at);
                        const slaMs = (approval.slaDays || defaultApprovalTimeoutDays) * 24 * 60 * 60 * 1000;
                        const isOverdue = approval.status !== 'completed' && (Date.now() - started.getTime() > slaMs);
                        return (
                          <div key={index} className="flex items-center space-x-2 min-w-0">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              approval.status === 'completed' ? 'bg-green-100 text-green-600' :
                              approval.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                              isOverdue ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {approval.status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
                               approval.status === 'in-progress' ? <Play className="h-4 w-4" /> :
                               isOverdue ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">{approval.step}</p>
                              <p className="text-xs text-gray-500 truncate">{approval.assignee}</p>
                              <p className="text-[10px] text-gray-400">
                                SLA: {(approval.slaDays || defaultApprovalTimeoutDays)} {language === 'ar' ? 'أيام' : 'days'}
                              </p>
                            </div>

                            <div className="flex items-center space-x-1">
                              {approval.status !== 'completed' && (
                                <AnimatedButton variant="ghost" size="xs" onClick={() => approveStep(workflow.id, index)}>
                                  {language === 'ar' ? 'اعتماد' : 'Approve'}
                                </AnimatedButton>
                              )}
                              {isOverdue && (
                                <AnimatedButton variant="danger" size="xs" onClick={() => escalateWorkflow(workflow.id)}>
                                  {language === 'ar' ? 'تصعيد' : 'Escalate'}
                                </AnimatedButton>
                              )}
                            </div>

                            {index < workflow.approvals.length - 1 && (
                              <ArrowRight className="h-3 w-3 text-gray-300 flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
  )}

  {/* Templates Tab */}
  {activeTab === 'templates' && (
    <div className="space-y-4">
          <AnimatedCard hover3D={false} culturalPattern={true}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'ar' ? 'دليل الإعداد' : 'Setup Guidance'}
              </h3>
              <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                <li>{language === 'ar' ? 'عيّن SLA لكل خطوة' : 'Set SLA for each step'}</li>
                <li>{language === 'ar' ? 'حدّد جهة التصعيد لكل خطوة' : 'Specify escalation contact per step'}</li>
                <li>{language === 'ar' ? 'احفظ الإعدادات ثم استخدم القالب' : 'Save settings, then use the template'}</li>
              </ul>
        </div>
      </AnimatedCard>

          {editableTemplates.map((template, tIdx) => (
            <AnimatedCard key={template.id} hover3D={true} culturalPattern={true}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {language === 'ar' ? template.nameAr : template.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'ar' ? template.descriptionAr : template.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <AnimatedButton variant="secondary" onClick={() => saveTemplateSLA(template.id)}>
                      {language === 'ar' ? 'حفظ SLA' : 'Save SLA'}
                    </AnimatedButton>
                    <AnimatedButton variant="primary">
                      <Plus className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'استخدام القالب' : 'Use Template'}
                    </AnimatedButton>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {language === 'ar' ? 'المدة المتوقعة:' : 'Estimated Duration:'} {template.estimatedDuration}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {language === 'ar' ? 'الفئة:' : 'Category:'} {template.category}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    {language === 'ar' ? 'خطوات سير العمل' : 'Workflow Steps'}
                  </h4>
                  <div className="space-y-4">
                    {template.steps.map((step, sIdx) => (
                      <div key={sIdx} className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                          <span className="text-sm font-medium text-gray-900">{sIdx + 1}. {step.label}</span>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">{language === 'ar' ? 'SLA (أيام)' : 'SLA (days)'}</label>
                            <input
                              type="number"
                              value={step.slaDays}
                              onChange={(e) => setEditableTemplates(prev => prev.map((tpl, idx) => idx === tIdx ? {
                                ...tpl,
                                steps: tpl.steps.map((st, j) => j === sIdx ? { ...st, slaDays: Math.max(1, Number(e.target.value || 1)) } : st)
                              } : tpl))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs text-gray-600 mb-1">{language === 'ar' ? 'التصعيد إلى' : 'Escalation To'}</label>
                            <input
                              type="text"
                              value={step.escalationTo}
                              onChange={(e) => setEditableTemplates(prev => prev.map((tpl, idx) => idx === tIdx ? {
                                ...tpl,
                                steps: tpl.steps.map((st, j) => j === sIdx ? { ...st, escalationTo: e.target.value } : st)
                              } : tpl))}
                              placeholder={language === 'ar' ? 'مدير / البريد الإلكتروني' : 'Manager / email'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">{language === 'ar' ? 'عتبة المخاطر' : 'Risk Threshold'}</label>
                            <input
                              type="number"
                              value={step.rules.conditions.riskScoreThreshold}
                              onChange={(e) => setEditableTemplates(prev => prev.map((tpl, idx) => idx === tIdx ? {
                                ...tpl,
                                steps: tpl.steps.map((st, j) => j === sIdx ? { ...st, rules: { ...st.rules, conditions: { ...st.rules.conditions, riskScoreThreshold: Number(e.target.value || 0) } } } : st)
                              } : tpl))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">{language === 'ar' ? 'الأيام حتى الاستحقاق' : 'Due Date (days)'}</label>
                            <input
                              type="number"
                              value={step.rules.conditions.dueDateDays}
                              onChange={(e) => setEditableTemplates(prev => prev.map((tpl, idx) => idx === tIdx ? {
                                ...tpl,
                                steps: tpl.steps.map((st, j) => j === sIdx ? { ...st, rules: { ...st.rules, conditions: { ...st.rules.conditions, dueDateDays: Number(e.target.value || 0) } } } : st)
                              } : tpl))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">{language === 'ar' ? 'دور المُعيّن' : 'Assignee Role'}</label>
                            <input
                              type="text"
                              value={step.rules.conditions.assigneeRole}
                              onChange={(e) => setEditableTemplates(prev => prev.map((tpl, idx) => idx === tIdx ? {
                                ...tpl,
                                steps: tpl.steps.map((st, j) => j === sIdx ? { ...st, rules: { ...st.rules, conditions: { ...st.rules.conditions, assigneeRole: e.target.value } } } : st)
                              } : tpl))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">{language === 'ar' ? 'إعادة التعيين إلى' : 'Reassign To'}</label>
                            <input
                              type="text"
                              value={step.rules.actions.reassignTo}
                              onChange={(e) => setEditableTemplates(prev => prev.map((tpl, idx) => idx === tIdx ? {
                                ...tpl,
                                steps: tpl.steps.map((st, j) => j === sIdx ? { ...st, rules: { ...st.rules, actions: { ...st.rules.actions, reassignTo: e.target.value } } } : st)
                              } : tpl))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">{language === 'ar' ? 'قنوات الإشعار (مفصولة بفواصل)' : 'Notify Channels (comma-separated)'}</label>
                            <input
                              type="text"
                              value={(step.rules.actions.notifyChannels || []).join(',')}
                              onChange={(e) => setEditableTemplates(prev => prev.map((tpl, idx) => idx === tIdx ? {
                                ...tpl,
                                steps: tpl.steps.map((st, j) => j === sIdx ? { ...st, rules: { ...st.rules, actions: { ...st.rules.actions, notifyChannels: e.target.value.split(',').map(v => v.trim()).filter(Boolean) } } } : st)
                              } : tpl))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              id={`pause-${tIdx}-${sIdx}`}
                              type="checkbox"
                              checked={!!step.rules.actions.pause}
                              onChange={(e) => setEditableTemplates(prev => prev.map((tpl, idx) => idx === tIdx ? {
                                ...tpl,
                                steps: tpl.steps.map((st, j) => j === sIdx ? { ...st, rules: { ...st.rules, actions: { ...st.rules.actions, pause: e.target.checked } } } : st)
                              } : tpl))}
                            />
                            <label htmlFor={`pause-${tIdx}-${sIdx}`} className="text-sm text-gray-700">{language === 'ar' ? 'إيقاف مؤقت' : 'Pause'}</label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
      </div>
    )}

    {showGuidanceToolkit && (
      <AnimatedCard hover3D={false} culturalPattern={true}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'ar' ? 'مجموعة أدوات الإرشاد' : 'Guidance Toolkit'}
            </h3>
            <div className="flex gap-2">
              {[
                { id: 'getting-started', name: language === 'ar' ? 'البدء' : 'Getting Started' },
                { id: 'automation', name: language === 'ar' ? 'الأتمتة' : 'Automation' },
                { id: 'sla-escalation', name: language === 'ar' ? 'SLA والتصعيد' : 'SLA & Escalation' },
                { id: 'templates', name: language === 'ar' ? 'القوالب' : 'Templates' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setGuidanceTab(t.id)}
                  className={`px-3 py-2 text-sm rounded-md ${guidanceTab === t.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {guidanceTab === 'getting-started' && (
            <div className="space-y-2 text-sm text-gray-700">
              <p>{language === 'ar' ? '1) أنشئ سير عمل من القوالب أو من الصفر.' : '1) Create a workflow from templates or from scratch.'}</p>
              <p>{language === 'ar' ? '2) حدّد الخطوات والموافقات.' : '2) Define steps and approvals.'}</p>
              <p>{language === 'ar' ? '3) عيّن المُعيّنين وتواريخ الاستحقاق.' : '3) Assign assignees and due dates.'}</p>
              <p>{language === 'ar' ? '4) راقب التقدّم والاعتمادات.' : '4) Monitor progress and approvals.'}</p>
            </div>
          )}

          {guidanceTab === 'automation' && (
            <div className="space-y-2 text-sm text-gray-700">
              <p>{language === 'ar' ? 'فعّل التشغيل الآلي في الإعدادات.' : 'Enable Automation in Settings.'}</p>
              <p>{language === 'ar' ? 'التصعيد التلقائي عند تجاوز SLA.' : 'Auto escalate when SLA is exceeded.'}</p>
              <p>{language === 'ar' ? 'اعتماد تلقائي للمهام منخفضة الأولوية.' : 'Auto-approve low-priority workflows.'}</p>
            </div>
          )}

          {guidanceTab === 'sla-escalation' && (
            <div className="space-y-2 text-sm text-gray-700">
              <p>{language === 'ar' ? 'اضبط SLA لكل خطوة في القوالب.' : 'Set SLA per step in Templates.'}</p>
              <p>{language === 'ar' ? 'حدّد جهة التصعيد لكل خطوة.' : 'Specify escalation target per step.'}</p>
              <p>{language === 'ar' ? 'يعرض الشريط سلسلة الموافقات والحالات المتأخرة.' : 'Approval chain shows overdue states with escalate option.'}</p>
            </div>
          )}

          {guidanceTab === 'templates' && (
            <div className="space-y-2 text-sm text-gray-700">
              <p>{language === 'ar' ? 'حرّر القواعد لكل خطوة (المخاطر/الأدوار/الإشعارات).' : 'Edit rules per step (risk/roles/notifications).'} </p>
              <p>{language === 'ar' ? 'احفظ إعدادات SLA والقواعد ثم استخدم القالب.' : 'Save SLA and rules, then use the template.'}</p>
            </div>
          )}
        </div>
      </AnimatedCard>
    )}
      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatedCard hover3D={false} culturalPattern={true}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'ar' ? 'توزيع حالة سير العمل' : 'Workflow Status Distribution'}
              </h3>
              <div className="space-y-3">
                {[
                  { status: 'Active', count: 12, color: 'bg-blue-500' },
                  { status: 'Completed', count: 28, color: 'bg-green-500' },
                  { status: 'Pending', count: 6, color: 'bg-yellow-500' },
                  { status: 'Overdue', count: 3, color: 'bg-red-500' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${item.color} rounded mr-2`}></div>
                      <span className="text-sm text-gray-700">{item.status}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard hover3D={false} culturalPattern={true}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'ar' ? 'معدلات الإنجاز الشهرية' : 'Monthly Completion Rates'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ar' ? 'يناير' : 'January'}</span>
                  <span className="text-sm font-medium">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ar' ? 'فبراير' : 'February'}</span>
                  <span className="text-sm font-medium">31</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ar' ? 'مارس' : 'March'}</span>
                  <span className="text-sm font-medium">28</span>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <AnimatedCard hover3D={false} culturalPattern={true}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'ar' ? 'إعدادات سير العمل' : 'Workflow Settings'}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {language === 'ar' ? 'الإشعارات التلقائية' : 'Automatic Notifications'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {language === 'ar' ? 'إرسال إشعارات عند تغيير حالة سير العمل' : 'Send notifications when workflow status changes'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {language === 'ar' ? 'التشغيل الآلي' : 'Automation'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {language === 'ar' ? 'تمكين التصعيد التلقائي عند تجاوز SLA' : 'Enable auto escalation when SLA is exceeded'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={automationEnabled} onChange={(e) => setAutomationEnabled(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {language === 'ar' ? 'اعتماد تلقائي منخفض الأولوية' : 'Auto-Approve Low Priority'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {language === 'ar' ? 'اعتماد الخطوات تلقائياً للمهام منخفضة الأولوية' : 'Automatically approve steps for low-priority workflows'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={automationRules.autoApproveLowPriority} onChange={(e) => setAutomationRules(r => ({ ...r, autoApproveLowPriority: e.target.checked }))} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'مهلة الموافقة الافتراضية (أيام)' : 'Default Approval Timeout (days)'}
                  </label>
                  <input
                    type="number"
                    value={defaultApprovalTimeoutDays}
                    onChange={(e) => setDefaultApprovalTimeoutDays(Math.max(1, Number(e.target.value || 1)))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
};

export default WorkflowManagementPage;
