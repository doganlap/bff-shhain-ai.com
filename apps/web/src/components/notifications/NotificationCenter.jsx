import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, X, Check, AlertTriangle, Info, CheckCircle, Clock,
  Shield, FileText, Target, Users, Settings, Trash2, MoreVertical
} from 'lucide-react';
import ArabicTextEngine from '../Arabic/ArabicTextEngine';

const NotificationCenter = ({ isOpen, onClose, onToggle }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  // Sample notification data - in real app this would come from API
  const sampleNotifications = [
    {
      id: '1',
      type: 'compliance',
      priority: 'high',
      title: 'تحديث مطلوب في إطار SAMA',
      titleEn: 'SAMA Framework Update Required',
      message: 'تم إصدار تحديث جديد لإطار مؤسسة النقد العربي السعودي يتطلب مراجعة 15 ضابط',
      messageEn: 'New SAMA framework update released requiring review of 15 controls',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      icon: Shield,
      action: {
        text: 'مراجعة التحديثات',
        textEn: 'Review Updates',
        url: '/frameworks/sama'
      },
      metadata: {
        source: 'نظام الامتثال',
        sourceEn: 'Compliance System',
        category: 'framework_update'
      }
    },
    {
      id: '2',
      type: 'assessment',
      priority: 'medium',
      title: 'تم اكتمال تقييم الأمن السيبراني',
      titleEn: 'Cybersecurity Assessment Completed',
      message: 'تم الانتهاء من تقييم الأمن السيبراني للربع الثالث بنسبة امتثال 94%',
      messageEn: 'Q3 cybersecurity assessment completed with 94% compliance rate',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      icon: CheckCircle,
      action: {
        text: 'عرض التقرير',
        textEn: 'View Report',
        url: '/assessments/cyber-q3'
      },
      metadata: {
        source: 'نظام التقييمات',
        sourceEn: 'Assessment System',
        category: 'assessment_complete'
      }
    },
    {
      id: '3',
      type: 'task',
      priority: 'medium',
      title: 'مهام مطلوبة للمراجعة',
      titleEn: 'Tasks Pending Review',
      message: 'لديك 7 مهام تتطلب المراجعة والاعتماد قبل انتهاء الأسبوع',
      messageEn: 'You have 7 tasks requiring review and approval before end of week',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: true,
      icon: Clock,
      action: {
        text: 'عرض المهام',
        textEn: 'View Tasks',
        url: '/tasks/pending'
      },
      metadata: {
        source: 'نظام إدارة المهام',
        sourceEn: 'Task Management System',
        category: 'task_reminder'
      }
    },
    {
      id: '4',
      type: 'risk',
      priority: 'high',
      title: 'تحديث تقييم المخاطر',
      titleEn: 'Risk Assessment Update',
      message: 'تم تحديد مخاطر جديدة تتطلب اهتمام فوري في قطاع تقنية المعلومات',
      messageEn: 'New risks identified requiring immediate attention in IT sector',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      read: true,
      icon: AlertTriangle,
      action: {
        text: 'مراجعة المخاطر',
        textEn: 'Review Risks',
        url: '/risks/it-sector'
      },
      metadata: {
        source: 'نظام إدارة المخاطر',
        sourceEn: 'Risk Management System',
        category: 'risk_alert'
      }
    },
    {
      id: '5',
      type: 'report',
      priority: 'low',
      title: 'تقرير شهري جاهز',
      titleEn: 'Monthly Report Ready',
      message: 'تم إنشاء التقرير الشهري للامتثال وهو جاهز للمراجعة والتصدير',
      messageEn: 'Monthly compliance report has been generated and is ready for review',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      icon: FileText,
      action: {
        text: 'تحميل التقرير',
        textEn: 'Download Report',
        url: '/reports/monthly/2024-03'
      },
      metadata: {
        source: 'نظام التقارير',
        sourceEn: 'Reporting System',
        category: 'report_ready'
      }
    }
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await apiServices.notifications.getAll();
        // if (response.success) {
        //   setNotifications(response.data || []);
        //   setUnreadCount((response.data || []).filter(n => !n.read).length);
        // }

        // For now, set empty array to avoid mock data
        setNotifications([]);
        setUnreadCount(0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    fetchNotifications();
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'high') return notification.priority === 'high';
    return notification.type === filter;
  });

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);

    if (diffInSeconds < 60) return 'الآن';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
  };

  // Filter options
  const filterOptions = [
    { id: 'all', name: 'الكل', nameEn: 'All', count: notifications.length },
    { id: 'unread', name: 'غير مقروءة', nameEn: 'Unread', count: unreadCount },
    { id: 'high', name: 'عالية الأولوية', nameEn: 'High Priority', count: notifications.filter(n => n.priority === 'high').length },
    { id: 'compliance', name: 'الامتثال', nameEn: 'Compliance', count: notifications.filter(n => n.type === 'compliance').length },
    { id: 'assessment', name: 'التقييمات', nameEn: 'Assessments', count: notifications.filter(n => n.type === 'assessment').length }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Notification Panel */}
      <motion.div
        initial={{ opacity: 0, x: 100, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.95 }}
        className="fixed top-0 end-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2 md:gap-3">
            <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                <ArabicTextEngine text="مركز الإشعارات" />
              </h2>
              <p className="text-xs md:text-sm text-gray-600">
                {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium touch-manipulation"
              >
                تعيين الكل كمقروء
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            >
              <X className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-3 md:p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setFilter(option.id)}
                className={`px-2 md:px-3 py-1.5 text-xs md:text-sm rounded-lg transition-colors touch-manipulation ${
                  filter === option.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <ArabicTextEngine text={option.name} />
                {option.count > 0 && (
                  <span className="mr-1 text-xs">({option.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => {
                const IconComponent = notification.icon;
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-b border-gray-100 p-3 md:p-4 hover:bg-gray-50 transition-colors group ${
                      !notification.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2 md:gap-3">
                      {/* Icon & Priority Indicator */}
                      <div className="relative">
                        <div className={`p-1.5 md:p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                          <IconComponent className="w-3 h-3 md:w-4 md:h-4" />
                        </div>
                        {!notification.read && (
                          <div className="absolute -top-0.5 -end-0.5 md:-top-1 md:-end-1 w-2 h-2 md:w-3 md:h-3 bg-blue-600 rounded-full"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1 md:gap-2">
                          <h3 className="font-semibold text-gray-900 text-xs md:text-sm">
                            <ArabicTextEngine text={notification.title} />
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded opacity-0 md:group-hover:opacity-100 transition-opacity touch-manipulation"
                          >
                            <Trash2 className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>

                        <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">
                          <ArabicTextEngine text={notification.message} />
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          <span className="text-xs text-gray-500">
                            <ArabicTextEngine text={notification.metadata.source} />
                          </span>
                        </div>

                        {/* Action Button */}
                        {notification.action && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              markAsRead(notification.id);
                              // Handle navigation here
                            }}
                            className="mt-2 md:mt-3 w-full px-2 md:px-3 py-1.5 md:py-2 bg-blue-50 text-blue-700 text-xs md:text-sm rounded-lg hover:bg-blue-100 transition-colors touch-manipulation"
                          >
                            <ArabicTextEngine text={notification.action.text} />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-48 md:h-64 text-gray-500 p-4 md:p-6">
                <Bell className="w-8 h-8 md:w-12 md:h-12 mb-3 md:mb-4 opacity-40" />
                <p className="text-center text-sm md:text-base">
                  <ArabicTextEngine text="لا توجد إشعارات" />
                </p>
                <p className="text-xs md:text-sm text-center mt-1">
                  ستظهر الإشعارات الجديدة هنا
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              إعدادات الإشعارات
            </button>
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              عرض الكل
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default NotificationCenter;
