import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Shield, Target, FileText, Building2, Users, BarChart3, Database, Settings, 
  Search, X, ChevronLeft, ChevronRight, Grid3X3, List, Filter,
  Activity, AlertTriangle, Archive, Bell, Bot, CheckCircle, Eye, HelpCircle,
  MessageSquare, ShieldCheck, UserCheck, Workflow, Zap, Star, TrendingUp,
  PieChart, Calendar, Download, Upload, RefreshCw, Play, Pause, Save,
  Edit, Trash2, Plus, Minus, Lock, Unlock, Mail, Phone, MapPin,
  Globe, Link, ExternalLink, Monitor, Smartphone, Tablet, Clock,
  Award, FileCheck, Briefcase, BookOpen, Lightbulb, Cpu, Server
} from 'lucide-react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { useTheme } from '../theme/ThemeProvider';

// Comprehensive page configuration with all available pages
const PAGE_CATEGORIES = {
  dashboard: {
    id: 'dashboard',
    name: 'لوحات القيادة',
    nameEn: 'Dashboards',
    icon: Home,
    color: 'from-blue-500 to-blue-600',
    pages: [
      { id: 'enhanced-dashboard', name: 'لوحة القيادة المحسنة', nameEn: 'Enhanced Dashboard', path: '/app', icon: Home },
      { id: 'dashboard-legacy', name: 'لوحة القيادة الكلاسيكية', nameEn: 'Legacy Dashboard', path: '/app/dashboard/legacy', icon: Activity },
      { id: 'advanced-dashboard', name: 'لوحة القيادة المتقدمة', nameEn: 'Advanced Dashboard', path: '/app/dashboard/advanced', icon: TrendingUp },
      { id: 'tenant-dashboard', name: 'لوحة قيادة المؤسسة', nameEn: 'Tenant Dashboard', path: '/tenant/:tenantId', icon: Building2 },
      { id: 'regulatory-market', name: 'السوق التنظيمي', nameEn: 'Regulatory Market', path: '/app/dashboard/regulatory-market', icon: Globe },
      { id: 'usage-dashboard', name: 'لوحة الاستخدام', nameEn: 'Usage Dashboard', path: '/platform/usage', icon: PieChart },
      { id: 'modern-advanced', name: 'لوحة حديثة متقدمة', nameEn: 'Modern Advanced Dashboard', path: '/platform/advanced-dashboard', icon: Monitor }
    ]
  },
  grc: {
    id: 'grc',
    name: 'إدارة المخاطر والامتثال',
    nameEn: 'GRC Modules',
    icon: Shield,
    color: 'from-emerald-500 to-emerald-600',
    pages: [
      { id: 'assessments', name: 'التقييمات', nameEn: 'Assessments', path: '/app/assessments', icon: Shield },
      { id: 'assessment-details', name: 'تفاصيل التقييم', nameEn: 'Assessment Details', path: '/app/assessments/:id', icon: FileText },
      { id: 'frameworks', name: 'الأطر التنظيمية', nameEn: 'Frameworks', path: '/app/frameworks', icon: Target },
      { id: 'controls', name: 'الضوابط', nameEn: 'Controls', path: '/app/controls', icon: CheckCircle },
      { id: 'compliance-enhanced', name: 'الامتثال المحسن', nameEn: 'Compliance Enhanced', path: '/app/compliance', icon: ShieldCheck },
      { id: 'compliance-legacy', name: 'الامتثال الكلاسيكي', nameEn: 'Compliance Legacy', path: '/app/compliance/legacy', icon: Archive },
      { id: 'risk-enhanced', name: 'إدارة المخاطر المحسنة', nameEn: 'Risk Management Enhanced', path: '/app/risks', icon: AlertTriangle },
      { id: 'risk-legacy', name: 'إدارة المخاطر الكلاسيكية', nameEn: 'Risk Management Legacy', path: '/app/risks/legacy', icon: Activity },
      { id: 'risks-list', name: 'قائمة المخاطر', nameEn: 'Risks List', path: '/app/risks/list', icon: List },
      { id: 'evidence', name: 'الأدلة', nameEn: 'Evidence', path: '/app/evidence', icon: FileText }
    ]
  },
  organizations: {
    id: 'organizations',
    name: 'إدارة المؤسسات',
    nameEn: 'Organizations',
    icon: Building2,
    color: 'from-purple-500 to-purple-600',
    pages: [
      { id: 'organizations-main', name: 'المؤسسات', nameEn: 'Organizations', path: '/app/organizations', icon: Building2 },
      { id: 'organizations-list', name: 'قائمة المؤسسات', nameEn: 'Organizations List', path: '/app/organizations/list', icon: List },
      { id: 'organization-new', name: 'مؤسسة جديدة', nameEn: 'New Organization', path: '/app/organizations/new', icon: Plus },
      { id: 'organization-details', name: 'تفاصيل المؤسسة', nameEn: 'Organization Details', path: '/app/organizations/:id', icon: Eye },
      { id: 'organization-edit', name: 'تعديل المؤسسة', nameEn: 'Edit Organization', path: '/app/organizations/:id/edit', icon: Edit }
    ]
  },
  system: {
    id: 'system',
    name: 'إدارة النظام',
    nameEn: 'System Management',
    icon: Settings,
    color: 'from-gray-500 to-gray-600',
    pages: [
      { id: 'settings', name: 'الإعدادات', nameEn: 'Settings', path: '/app/settings', icon: Settings },
      { id: 'database', name: 'قاعدة البيانات', nameEn: 'Database', path: '/app/database', icon: Database },
      { id: 'api-management', name: 'إدارة واجهة البرمجة', nameEn: 'API Management', path: '/app/api-management', icon: Server },
      { id: 'performance', name: 'مراقبة الأداء', nameEn: 'Performance Monitor', path: '/app/performance', icon: Activity },
      { id: 'users', name: 'إدارة المستخدمين', nameEn: 'User Management', path: '/app/users', icon: Users },
      { id: 'audit-logs', name: 'سجلات التدقيق', nameEn: 'Audit Logs', path: '/app/audit-logs', icon: Archive },
      { id: 'workflows', name: 'إدارة سير العمل', nameEn: 'Workflow Management', path: '/app/workflows', icon: Workflow },
      { id: 'notifications', name: 'إدارة الإشعارات', nameEn: 'Notification Management', path: '/app/notifications', icon: Bell },
      { id: 'documents', name: 'إدارة المستندات', nameEn: 'Document Management', path: '/app/documents', icon: FileText }
    ]
  },
  ai: {
    id: 'ai',
    name: 'الذكاء الاصطناعي',
    nameEn: 'AI Services',
    icon: Bot,
    color: 'from-indigo-500 to-indigo-600',
    pages: [
      { id: 'ai-scheduler', name: 'مجدول الذكاء الاصطناعي', nameEn: 'AI Scheduler', path: '/app/ai-scheduler', icon: Calendar },
      { id: 'rag-service', name: 'خدمة RAG', nameEn: 'RAG Service', path: '/app/rag-service', icon: Cpu },
      { id: 'auto-assessment', name: 'منشئ التقييم التلقائي', nameEn: 'Auto Assessment Generator', path: '/platform/auto-assessment', icon: Zap }
    ]
  },
  platform: {
    id: 'platform',
    name: 'إدارة المنصة',
    nameEn: 'Platform Management',
    icon: Server,
    color: 'from-orange-500 to-orange-600',
    pages: [
      { id: 'licenses', name: 'إدارة التراخيص', nameEn: 'License Management', path: '/platform/licenses', icon: FileCheck },
      { id: 'renewals', name: 'خط تجديد التراخيص', nameEn: 'Renewals Pipeline', path: '/platform/renewals', icon: RefreshCw },
      { id: 'upgrade', name: 'ترقية الحساب', nameEn: 'Upgrade Account', path: '/platform/upgrade', icon: TrendingUp },
      { id: 'partners', name: 'إدارة الشركاء', nameEn: 'Partner Management', path: '/app/partners', icon: Briefcase }
    ]
  },
  regulatory: {
    id: 'regulatory',
    name: 'الذكاء التنظيمي',
    nameEn: 'Regulatory Intelligence',
    icon: Globe,
    color: 'from-teal-500 to-teal-600',
    pages: [
      { id: 'regulatory-intelligence', name: 'الذكاء التنظيمي', nameEn: 'Regulatory Intelligence', path: '/app/regulatory-intelligence', icon: Lightbulb },
      { id: 'regulatory-engine', name: 'محرك التنظيم', nameEn: 'Regulatory Engine', path: '/app/regulatory-engine', icon: Cpu },
      { id: 'regulators', name: 'الجهات التنظيمية', nameEn: 'Regulators', path: '/app/regulators', icon: Award },
      { id: 'sector-intelligence', name: 'ذكاء القطاعات', nameEn: 'Sector Intelligence', path: '/app/sector-intelligence', icon: PieChart },
      { id: 'ksa-grc', name: 'إدارة المخاطر السعودية', nameEn: 'KSA GRC', path: '/app/ksa-grc', icon: Globe }
    ]
  },
  reports: {
    id: 'reports',
    name: 'التقارير والتحليلات',
    nameEn: 'Reports & Analytics',
    icon: BarChart3,
    color: 'from-rose-500 to-rose-600',
    pages: [
      { id: 'reports', name: 'التقارير', nameEn: 'Reports', path: '/app/reports', icon: BarChart3 }
    ]
  },
  demo: {
    id: 'demo',
    name: 'العروض التوضيحية',
    nameEn: 'Demo & Components',
    icon: Eye,
    color: 'from-cyan-500 to-cyan-600',
    pages: [
      { id: 'components-demo', name: 'عرض المكونات', nameEn: 'Components Demo', path: '/app/components-demo', icon: Grid3X3 },
      { id: 'modern-components', name: 'المكونات الحديثة', nameEn: 'Modern Components', path: '/app/modern-components-demo', icon: Smartphone },
      { id: 'demo-page', name: 'صفحة التجربة', nameEn: 'Demo Page', path: '/demo', icon: Play }
    ]
  }
};

const ModernSlideNavigator = ({ isOpen, onClose, className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, isRTL, t } = useI18n();
  const { isDark } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filteredPages, setFilteredPages] = useState([]);

  // Get display name based on current language
  const getDisplayName = (item) => {
    return language === 'ar' ? item.name : item.nameEn;
  };

  // Filter pages based on search query and category
  const filteredCategories = useMemo(() => {
    if (!searchQuery && !selectedCategory) return PAGE_CATEGORIES;

    const filtered = {};
    Object.keys(PAGE_CATEGORIES).forEach(categoryKey => {
      const category = PAGE_CATEGORIES[categoryKey];
      let pages = category.pages;

      // Filter by search query
      if (searchQuery) {
        pages = pages.filter(page => 
          page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.path.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Filter by selected category
      if (selectedCategory && selectedCategory !== categoryKey) {
        pages = [];
      }

      if (pages.length > 0) {
        filtered[categoryKey] = { ...category, pages };
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory]);

  // Get total page count
  const totalPages = useMemo(() => {
    return Object.values(PAGE_CATEGORIES).reduce((total, category) => total + category.pages.length, 0);
  }, []);

  const handlePageClick = (path) => {
    navigate(path);
    onClose?.();
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        dir={isRTL() ? 'rtl' : 'ltr'}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Navigator Panel */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden ${
            isDark() ? 'bg-gray-900 border border-gray-700' : 'bg-white'
          } ${className}`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${isDark() ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Grid3X3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'ar' ? 'مستكشف الصفحات المتقدم' : 'Advanced Page Navigator'}
                  </h2>
                  <p className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'ar' ? `${totalPages} صفحة متاحة` : `${totalPages} pages available`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark() ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search and Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  isDark() ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'البحث في الصفحات...' : 'Search pages...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark() 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark() ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                </button>
                
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark() 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
                  {Object.entries(PAGE_CATEGORIES).map(([key, category]) => (
                    <option key={key} value={key}>
                      {getDisplayName(category)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-180px)]">
            {Object.entries(filteredCategories).map(([categoryKey, category]) => (
              <motion.div
                key={categoryKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 last:mb-0"
              >
                {/* Category Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>
                    <category.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className={`text-lg font-semibold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                    {getDisplayName(category)}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isDark() ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {category.pages.length}
                  </span>
                </div>

                {/* Pages Grid/List */}
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3' 
                  : 'space-y-2'
                }>
                  {category.pages.map((page) => {
                    const Icon = page.icon;
                    const isActive = location.pathname === page.path || location.pathname.startsWith(page.path.replace('/:id', '/'));
                    
                    return (
                      <motion.button
                        key={page.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePageClick(page.path)}
                        className={`${viewMode === 'grid' ? 'p-4' : 'p-3 flex items-center space-x-3'} 
                          rounded-lg border transition-all duration-200 text-left w-full ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : isDark()
                              ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-white'
                              : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-900'
                        }`}
                      >
                        {viewMode === 'grid' ? (
                          <div className="text-center">
                            <div className={`inline-flex p-3 rounded-lg mb-3 ${
                              isActive ? 'bg-blue-100' : isDark() ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              <Icon className={`h-6 w-6 ${
                                isActive ? 'text-blue-600' : isDark() ? 'text-gray-300' : 'text-gray-600'
                              }`} />
                            </div>
                            <h4 className="font-medium text-sm mb-1">
                              {getDisplayName(page)}
                            </h4>
                            <p className={`text-xs ${
                              isActive ? 'text-blue-600' : isDark() ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {page.path}
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className={`p-2 rounded-lg ${
                              isActive ? 'bg-blue-100' : isDark() ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              <Icon className={`h-4 w-4 ${
                                isActive ? 'text-blue-600' : isDark() ? 'text-gray-300' : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">
                                {getDisplayName(page)}
                              </h4>
                              <p className={`text-xs ${
                                isActive ? 'text-blue-600' : isDark() ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {page.path}
                              </p>
                            </div>
                            {isActive && (
                              <div className="flex-shrink-0">
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                              </div>
                            )}
                          </>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ))}

            {Object.keys(filteredCategories).length === 0 && (
              <div className="text-center py-12">
                <Search className={`h-12 w-12 mx-auto mb-4 ${
                  isDark() ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <h3 className={`text-lg font-medium mb-2 ${
                  isDark() ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {language === 'ar' ? 'لم توجد صفحات' : 'No pages found'}
                </h3>
                <p className={`text-sm ${
                  isDark() ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {language === 'ar' ? 'جرب مصطلح بحث مختلف' : 'Try a different search term'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`p-4 border-t text-center ${
            isDark() ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
          }`}>
            <p className={`text-xs ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'ar' 
                ? `منصة إدارة المخاطر والامتثال • ${Object.keys(filteredCategories).length} فئة • ${Object.values(filteredCategories).reduce((total, cat) => total + cat.pages.length, 0)} صفحة`
                : `GRC Master Platform • ${Object.keys(filteredCategories).length} categories • ${Object.values(filteredCategories).reduce((total, cat) => total + cat.pages.length, 0)} pages`
              }
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModernSlideNavigator;
