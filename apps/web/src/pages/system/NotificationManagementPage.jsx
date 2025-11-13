import React, { useState, useEffect } from 'react';
import {
  Bell, X, Check, AlertTriangle, Info, CheckCircle, Clock, Filter, Search,
  Shield, FileText, Target, Users, Settings, Trash2, MoreVertical, Send,
  Mail, MessageSquare, Smartphone, Calendar, BarChart3, TrendingUp,
  Edit, Eye, Play, Pause, Archive, RefreshCw, Zap, Volume2, VolumeX
} from 'lucide-react';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner, AnimatedProgress } from '../../components/Animation/InteractiveAnimationToolkit';
import apiService from '../../services/apiEndpoints';
import { useI18n } from '../../hooks/useI18n';

const NotificationManagementPage = () => {
  const { t, language, changeLanguage, isRTL } = useI18n();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  // Real notification statistics from API
  const [notificationStats, setNotificationStats] = useState({
    totalNotifications: 0,
    unreadCount: 0,
    todayCount: 0,
    averageResponseTime: '0 hours',
    templateCount: 0,
    channelCount: 0
  });

  useEffect(() => {
    loadNotifications();
    loadNotificationStats();
  }, [searchTerm, filterBy]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Load notifications from API
      const response = await apiService.notifications.getAll({
        page: 1,
        limit: 50,
        search: searchTerm,
        status: filterBy !== 'all' ? filterBy : undefined
      });

      if (response?.data?.success && response.data.data) {
        setNotifications(response.data.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationStats = async () => {
    try {
      const response = await apiService.notifications.getStats();
      if (response?.data?.success && response.data.data) {
        setNotificationStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };


  // Notification templates
  const notificationTemplates = [
    {
      id: 'template-1',
      name: 'Compliance Alert Template',
      nameAr: 'قالب تنبيه الامتثال',
      description: 'Standard template for compliance-related notifications',
      descriptionAr: 'قالب قياسي للإشعارات المتعلقة بالامتثال',
      type: 'compliance',
      channels: ['email', 'in-app'],
      priority: 'high',
      variables: ['framework_name', 'control_count', 'deadline'],
      active: true
    },
    {
      id: 'template-2',
      name: 'Assessment Completion Template',
      nameAr: 'قالب إكمال التقييم',
      description: 'Template for assessment completion notifications',
      descriptionAr: 'قالب لإشعارات إكمال التقييمات',
      type: 'assessment',
      channels: ['email', 'in-app', 'dashboard'],
      priority: 'medium',
      variables: ['assessment_name', 'score', 'report_link'],
      active: true
    },
    {
      id: 'template-3',
      name: 'Workflow Approval Template',
      nameAr: 'قالب موافقة سير العمل',
      description: 'Template for workflow approval requests',
      descriptionAr: 'قالب لطلبات موافقة سير العمل',
      type: 'workflow',
      channels: ['email', 'sms'],
      priority: 'medium',
      variables: ['workflow_name', 'requester', 'deadline'],
      active: true
    }
  ];

  // Notification channels
  const notificationChannels = [
    {
      id: 'email',
      name: 'Email',
      nameAr: 'البريد الإلكتروني',
      icon: Mail,
      enabled: true,
      settings: {
        smtpServer: 'smtp.company.com',
        port: 587,
        encryption: 'TLS'
      }
    },
    {
      id: 'sms',
      name: 'SMS',
      nameAr: 'رسائل نصية',
      icon: Smartphone,
      enabled: true,
      settings: {
        provider: 'Twilio',
        apiKey: '***********'
      }
    },
    {
      id: 'in-app',
      name: 'In-App',
      nameAr: 'داخل التطبيق',
      icon: Bell,
      enabled: true,
      settings: {
        showBadges: true,
        playSound: true
      }
    },
    {
      id: 'push',
      name: 'Push Notifications',
      nameAr: 'إشعارات فورية',
      icon: Smartphone,
      enabled: false,
      settings: {
        vapidKey: '***********'
      }
    },
    {
      id: 'webhook',
      name: 'Webhook',
      nameAr: 'ويب هوك',
      icon: Zap,
      enabled: true,
      settings: {
        url: 'https://api.company.com/webhooks/notifications',
        secret: '***********'
      }
    }
  ];

  const handleMarkAsRead = async (notificationIds) => {
    try {
      await apiService.notifications.markAsRead(notificationIds);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleBulkAction = async (action, notificationIds) => {
    try {
      switch (action) {
        case 'mark_read':
          await apiService.notifications.markAsRead(notificationIds);
          break;
        case 'mark_unread':
          await apiService.notifications.markAsUnread(notificationIds);
          break;
        case 'archive':
          await apiService.notifications.archive(notificationIds);
          break;
        case 'delete':
          await apiService.notifications.delete(notificationIds);
          break;
      }
      await loadNotifications();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'compliance': return Shield;
      case 'assessment': return Target;
      case 'workflow': return Settings;
      case 'partner': return Users;
      case 'system': return Info;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'pending_action': return 'bg-orange-100 text-orange-800';
      case 'archived': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filterBy === 'all' ||
                          (filterBy === 'unread' && notification.status === 'unread') ||
                          (filterBy === 'priority' && notification.priority === 'high') ||
                          notification.type === filterBy;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          notification.titleAr.includes(searchTerm) ||
                          notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const tabs = [
    { id: 'notifications', name: 'الإشعارات', nameEn: 'Notifications', icon: Bell },
    { id: 'templates', name: 'القوالب', nameEn: 'Templates', icon: FileText },
    { id: 'channels', name: 'القنوات', nameEn: 'Channels', icon: MessageSquare },
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
            {language === 'ar' ? 'مركز الإشعارات' : 'Notification Center'}
          </ArabicTextEngine>
          <ArabicTextEngine
            personalityType="casual"
            style={{ fontSize: '16px', color: '#6b7280', marginTop: '8px' }}
          >
            {language === 'ar' ? 'إدارة وتتبع جميع إشعارات النظام والتنبيهات' : 'Manage and track all system notifications and alerts'}
          </ArabicTextEngine>
        </div>

        <div className="flex gap-3">
          <AnimatedButton
            variant="secondary"
            onClick={() => changeLanguage(language === 'ar' ? 'en' : 'ar')}
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </AnimatedButton>

          <AnimatedButton variant="primary">
            <Send className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'إرسال إشعار جديد' : 'Send New Notification'}
          </AnimatedButton>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{notificationStats.totalNotifications}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'إجمالي الإشعارات' : 'Total Notifications'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{notificationStats.unreadCount}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'غير مقروءة' : 'Unread'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{notificationStats.todayCount}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'اليوم' : 'Today'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{notificationStats.averageResponseTime}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'متوسط وقت الاستجابة' : 'Avg Response Time'}
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

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
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
                      placeholder={language === 'ar' ? 'البحث في الإشعارات...' : 'Search notifications...'}
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
                    <option value="all">{language === 'ar' ? 'جميع الإشعارات' : 'All Notifications'}</option>
                    <option value="unread">{language === 'ar' ? 'غير مقروءة' : 'Unread'}</option>
                    <option value="priority">{language === 'ar' ? 'عالية الأولوية' : 'High Priority'}</option>
                    <option value="compliance">{language === 'ar' ? 'الامتثال' : 'Compliance'}</option>
                    <option value="workflow">{language === 'ar' ? 'سير العمل' : 'Workflow'}</option>
                  </select>

                  {selectedNotifications.length > 0 && (
                    <div className="flex gap-2">
                      <AnimatedButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleBulkAction('mark_read', selectedNotifications)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {language === 'ar' ? 'تعيين كمقروء' : 'Mark Read'}
                      </AnimatedButton>
                      <AnimatedButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleBulkAction('archive', selectedNotifications)}
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        {language === 'ar' ? 'أرشفة' : 'Archive'}
                      </AnimatedButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const TypeIcon = getTypeIcon(notification.type);
              return (
                <AnimatedCard key={notification.id} hover3D={true} culturalPattern={true}>
                  <div className={`p-6 border-l-4 ${
                    notification.status === 'unread' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedNotifications([...selectedNotifications, notification.id]);
                              } else {
                                setSelectedNotifications(selectedNotifications.filter(id => id !== notification.id));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {language === 'ar' ? notification.titleAr : notification.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                              {notification.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                              {notification.priority.toUpperCase()}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            {language === 'ar' ? notification.messageAr : notification.message}
                          </p>

                          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                            <span>{notification.source}</span>
                            <span>•</span>
                            <span>{notification.channel}</span>
                            <span>•</span>
                            <span>{notification.timestamp}</span>
                            <span>•</span>
                            <span>{notification.recipient}</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {notification.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {notification.actions.map((action, index) => (
                          <AnimatedButton key={index} variant="ghost" size="sm">
                            {action === 'view_details' && <Eye className="h-4 w-4" />}
                            {action === 'mark_read' && <Check className="h-4 w-4" />}
                            {action === 'approve' && <CheckCircle className="h-4 w-4" />}
                            {action === 'reject' && <X className="h-4 w-4" />}
                          </AnimatedButton>
                        ))}
                        <AnimatedButton variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </AnimatedButton>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {notificationTemplates.map((template) => (
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

                  <div className="flex items-center space-x-2">
                    {template.active ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {language === 'ar' ? 'نشط' : 'Active'}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {language === 'ar' ? 'غير نشط' : 'Inactive'}
                      </span>
                    )}

                    <AnimatedButton variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </AnimatedButton>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'النوع' : 'Type'}
                    </p>
                    <p className="text-sm text-gray-600">{template.type}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'القنوات' : 'Channels'}
                    </p>
                    <p className="text-sm text-gray-600">{template.channels.join(', ')}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'الأولوية' : 'Priority'}
                    </p>
                    <p className="text-sm text-gray-600">{template.priority}</p>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}

      {/* Channels Tab */}
      {activeTab === 'channels' && (
        <div className="space-y-4">
          {notificationChannels.map((channel) => {
            const IconComponent = channel.icon;
            return (
              <AnimatedCard key={channel.id} hover3D={true} culturalPattern={true}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-full ${channel.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <IconComponent className={`h-6 w-6 ${channel.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {language === 'ar' ? channel.nameAr : channel.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {channel.enabled ?
                            (language === 'ar' ? 'مفعل ومتصل' : 'Enabled and connected') :
                            (language === 'ar' ? 'معطل' : 'Disabled')
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={channel.enabled}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>

                      <AnimatedButton variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </AnimatedButton>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      {language === 'ar' ? 'الإعدادات' : 'Settings'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      {Object.entries(channel.settings).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-gray-900">{typeof value === 'string' && value.includes('*') ? '***' : String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatedCard hover3D={false} culturalPattern={true}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'ar' ? 'توزيع أنواع الإشعارات' : 'Notification Type Distribution'}
              </h3>
              <div className="space-y-3">
                {[
                  { type: 'Compliance', count: 45, color: 'bg-blue-500' },
                  { type: 'Assessment', count: 32, color: 'bg-green-500' },
                  { type: 'Workflow', count: 28, color: 'bg-yellow-500' },
                  { type: 'Partner', count: 18, color: 'bg-purple-500' },
                  { type: 'System', count: 12, color: 'bg-red-500' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${item.color} rounded mr-2`}></div>
                      <span className="text-sm text-gray-700">{item.type}</span>
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
                {language === 'ar' ? 'معدلات الاستجابة' : 'Response Rates'}
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">{language === 'ar' ? 'معدل الفتح' : 'Open Rate'}</span>
                    <span className="text-sm font-medium">87.3%</span>
                  </div>
                  <AnimatedProgress value={87.3} max={100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">{language === 'ar' ? 'معدل النقر' : 'Click Rate'}</span>
                    <span className="text-sm font-medium">42.1%</span>
                  </div>
                  <AnimatedProgress value={42.1} max={100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">{language === 'ar' ? 'معدل الاستجابة' : 'Action Rate'}</span>
                    <span className="text-sm font-medium">68.9%</span>
                  </div>
                  <AnimatedProgress value={68.9} max={100} className="h-2" />
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
                {language === 'ar' ? 'إعدادات الإشعارات العامة' : 'General Notification Settings'}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {language === 'ar' ? 'تجميع الإشعارات' : 'Bundle Notifications'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {language === 'ar' ? 'تجميع الإشعارات المتشابهة معاً' : 'Group similar notifications together'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'تكرار الإشعارات (دقائق)' : 'Notification Frequency (minutes)'}
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                    <option>15</option>
                    <option>30</option>
                    <option>60</option>
                    <option>120</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'مدة الاحتفاظ بالإشعارات (أيام)' : 'Notification Retention (days)'}
                  </label>
                  <input
                    type="number"
                    defaultValue={30}
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

export default NotificationManagementPage;
