import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Shield, Home, FileText, Target, AlertTriangle, 
  CheckCircle, Users, Building2, BarChart3, Settings,
  Menu, X, Bell, Search, Globe, Sun, Moon, 
  ChevronRight, Activity, TrendingUp,
  Award, Briefcase, Database, Lock, Loader2
} from 'lucide-react';
import { Calendar, CreditCard, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../theme/ThemeProvider';
import apiService from '@/services/apiEndpoints';
import ProcessGuideBanner from '../guidance/ProcessGuideBanner';
import { processGuides, resolveGuideKey } from '../../config/processGuides';

const AdvancedShell = ({ children, activeSection, onNavigate }) => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { state } = useApp();
  const { language, changeLanguage } = useI18n();
  const { isDark, toggleTheme } = useTheme();
  
  // Real data states
  const [complianceScore, setComplianceScore] = useState(null);
  const [riskCount, setRiskCount] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch real data from API
  useEffect(() => {
    fetchRealData();
  }, []);
  
  const fetchRealData = async () => {
    try {
      setLoading(true);
      
      // Fetch compliance score from API
      const complianceRes = await apiService.dashboard.getStats();
      if (complianceRes?.data?.compliance_score) {
        setComplianceScore(complianceRes.data.compliance_score);
      }
      
      // Fetch risk count from API
      const risksRes = await apiService.risks.getAll();
      if (risksRes?.data?.data) {
        const activeRisks = risksRes.data.data.filter(r => r.status === 'active' || r.severity === 'high');
        setRiskCount(activeRisks.length);
      }
      
      // Fetch notifications
      const notifRes = await apiService.notifications?.getUnread?.();
      if (notifRes?.data) {
        setNotifications(notifRes.data);
      }
      
    } catch (error) {
      console.error('Error fetching real data:', error);
      // Don't set mock data, just leave empty
      setComplianceScore(null);
      setRiskCount(null);
    } finally {
      setLoading(false);
    }
  };

  const navigationSections = [
    {
      id: 'dashboard',
      title: language === 'ar' ? 'لوحات المعلومات' : 'Dashboards',
      icon: BarChart3,
      items: [
        { id: 'dashboard', name: language === 'ar' ? 'اللوحة الرئيسية' : 'Main Dashboard', icon: Home },
        { id: 'modern-dashboard', name: language === 'ar' ? 'لوحة حديثة' : 'Modern Dashboard', icon: BarChart3 },
        { id: 'tenant-dashboard', name: language === 'ar' ? 'لوحة المستأجر' : 'Tenant Dashboard', icon: Building2 },
        { id: 'regulatory-dashboard', name: language === 'ar' ? 'لوحة تنظيمية' : 'Regulatory Dashboard', icon: Award },
        { id: 'usage-dashboard', name: language === 'ar' ? 'لوحة الاستخدام' : 'Usage Dashboard', icon: Activity },
      ]
    },
    {
      id: 'system',
      title: language === 'ar' ? 'النظام والإدارة' : 'System & Admin',
      icon: Settings,
      items: [
        { id: 'settings', name: language === 'ar' ? 'الإعدادات' : 'Settings', icon: Settings },
        { id: 'database', name: language === 'ar' ? 'قاعدة البيانات' : 'Database', icon: Database },
        { id: 'api-management', name: language === 'ar' ? 'إدارة واجهات API' : 'API Management', icon: Globe },
        { id: 'performance', name: language === 'ar' ? 'مراقبة الأداء' : 'Performance Monitor', icon: Activity },
        { id: 'audit-logs', name: language === 'ar' ? 'سجلات التدقيق' : 'Audit Logs', icon: FileText },
        { id: 'workflows', name: language === 'ar' ? 'سير العمل' : 'Workflows', icon: TrendingUp },
        { id: 'notifications', name: language === 'ar' ? 'الإشعارات' : 'Notifications', icon: Bell },
        { id: 'documents', name: language === 'ar' ? 'المستندات' : 'Documents', icon: FileText },
        { id: 'vercel-status', name: language === 'ar' ? 'حالة Vercel' : 'Vercel Status', icon: Activity },
        { id: 'mission-control', name: language === 'ar' ? 'مركز التحكم بالذكاء الاصطناعي' : 'AI Mission Control', icon: Shield, requiredRole: 'super_admin' },
      ]
    },
    {
      id: 'core',
      title: language === 'ar' ? 'الأساسيات' : 'Core GRC',
      icon: Shield,
      items: [
        { id: 'assessments', name: language === 'ar' ? 'التقييمات' : 'Assessments', icon: FileText },
        { id: 'frameworks', name: language === 'ar' ? 'الأطر' : 'Frameworks', icon: Target },
        { id: 'evidence', name: language === 'ar' ? 'الأدلة' : 'Evidence', icon: CheckCircle },
      ]
    },
    {
      id: 'risk',
      title: language === 'ar' ? 'المخاطر والامتثال' : 'Risk & Compliance',
      icon: AlertTriangle,
      items: [
        { id: 'risks', name: language === 'ar' ? 'إدارة المخاطر' : 'Risk Management', icon: AlertTriangle },
        { id: 'compliance', name: language === 'ar' ? 'الامتثال' : 'Compliance', icon: CheckCircle },
        { id: 'controls', name: language === 'ar' ? 'الضوابط' : 'Controls', icon: Lock },
      ]
    },
    {
      id: 'organization',
      title: language === 'ar' ? 'المؤسسة' : 'Organization',
      icon: Building2,
      items: [
        { id: 'organizations', name: language === 'ar' ? 'المنظمات' : 'Organizations', icon: Building2 },
        { id: 'users', name: language === 'ar' ? 'المستخدمين' : 'Users', icon: Users },
        { id: 'organization-details', name: language === 'ar' ? 'تفاصيل المنظمة' : 'Organization Details', icon: Briefcase },
      ]
    },
    {
      id: 'ai-services',
      title: language === 'ar' ? 'خدمات الذكاء الاصطناعي' : 'AI Services',
      icon: TrendingUp,
      items: [
        { id: 'ai-scheduler', name: language === 'ar' ? 'جدول الذكاء الاصطناعي' : 'AI Scheduler', icon: Calendar },
        { id: 'rag', name: language === 'ar' ? 'خدمة RAG' : 'RAG Service', icon: Database },
      ]
    },
    {
      id: 'platform',
      title: language === 'ar' ? 'المنصة والتراخيص' : 'Platform & Licensing',
      icon: Award,
      items: [
        { id: 'licenses', name: language === 'ar' ? 'إدارة التراخيص' : 'License Management', icon: CreditCard },
        { id: 'renewals', name: language === 'ar' ? 'التجديدات' : 'Renewals', icon: Calendar },
        { id: 'upgrade', name: language === 'ar' ? 'الترقية' : 'Upgrade', icon: TrendingUp },
        { id: 'auto-assessment', name: language === 'ar' ? 'التقييم التلقائي' : 'Auto Assessment', icon: Target },
        { id: 'partners', name: language === 'ar' ? 'الشركاء' : 'Partners', icon: Users },
      ]
    },
    {
      id: 'regulatory',
      title: language === 'ar' ? 'الذكاء التنظيمي' : 'Regulatory Intelligence',
      icon: Globe,
      items: [
        { id: 'regulatory-engine', name: language === 'ar' ? 'محرك الذكاء التنظيمي' : 'Regulatory Engine', icon: TrendingUp },
        { id: 'regulators', name: language === 'ar' ? 'الجهات التنظيمية' : 'Regulators', icon: Shield },
        { id: 'sector-intelligence', name: language === 'ar' ? 'ذكاء القطاع' : 'Sector Intelligence', icon: BarChart3 },
        { id: 'ksa-grc', name: language === 'ar' ? 'حوكمة المملكة' : 'KSA GRC', icon: Award },
      ]
    },
    {
      id: 'auth',
      title: language === 'ar' ? 'الدخول والمصادقة' : 'Authentication',
      icon: Lock,
      items: [
        { id: 'login', name: language === 'ar' ? 'تسجيل الدخول' : 'Login', icon: Lock },
        { id: 'register', name: language === 'ar' ? 'التسجيل' : 'Register', icon: Users },
      ]
    },
    {
      id: 'public',
      title: language === 'ar' ? 'العامة' : 'Public',
      icon: Globe,
      items: [
        { id: 'landing', name: language === 'ar' ? 'الصفحة الرئيسية' : 'Landing Page', icon: Home },
        { id: 'demo', name: language === 'ar' ? 'العرض التوضيحي' : 'Demo', icon: Play },
        { id: 'components-demo', name: language === 'ar' ? 'عرض المكونات' : 'Components Demo', icon: Target },
        { id: 'modern-demo', name: language === 'ar' ? 'العرض الحديث' : 'Modern Demo', icon: Award },
      ]
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      {/* Advanced Sidebar */}
      <aside className={`fixed top-0 ${language === 'ar' ? 'right-0' : 'left-0'} h-full transition-all duration-300 z-40 ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      } bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 dark:border-gray-700/50`}>
        
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200/50 dark:border-gray-700/50">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Shahin-AI KSA
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400" dir="rtl">
                  شاهين الذكي السعودية
                </p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100%-5rem)]">
          {navigationSections.map((section) => (
            <div key={section.id}>
              {!sidebarCollapsed && (
                <div className="flex items-center gap-2 px-3 py-2 mb-2">
                  <section.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </span>
                </div>
              )}
              <div className="space-y-1">
                {section.items
                  .filter(item => !item.requiredRole || state.user?.role === item.requiredRole)
                  .map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => onNavigate && onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    title={sidebarCollapsed ? item.name : ''}
                    aria-label={item.name}
                  >
                    <item.icon className={`w-5 h-5 ${sidebarCollapsed ? 'mx-auto' : ''}`} />
                    {!sidebarCollapsed && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${
        language === 'ar' 
          ? (sidebarCollapsed ? 'mr-20' : 'mr-72')
          : (sidebarCollapsed ? 'ml-20' : 'ml-72')
      }`}>
        {/* Advanced Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="h-20 px-6 flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                <input
                  type="text"
                  id="platform-search"
                  placeholder={language === 'ar' ? 'البحث في المنصة...' : 'Search platform...'}
                  className={`w-full ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                  aria-label={language === 'ar' ? 'البحث في المنصة' : 'Search platform'}
                />
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4 ml-6">
              {/* KPI Indicators - Real Data */}
              <div className="hidden lg:flex items-center gap-4">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <>
                    {complianceScore !== null && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          {language === 'ar' ? `${complianceScore}% امتثال` : `${complianceScore}% Compliant`}
                        </span>
                      </div>
                    )}
                    {riskCount !== null && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                          {language === 'ar' ? `${riskCount} مخاطر` : `${riskCount} Risks`}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Language Toggle */}
              <button
                type="button"
                onClick={() => changeLanguage(language === 'ar' ? 'en' : 'ar')}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label={language === 'ar' ? "Switch to English" : "Switch to Arabic"}
              >
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {/* Notifications */}
              <button 
                type="button"
                className="relative p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label={`Notifications (${notifications.length} unread)`}
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* User Profile - Real User Data */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {state?.user?.name || (language === 'ar' ? 'مستخدم' : 'User')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {state?.user?.role || (language === 'ar' ? 'دور' : 'Role')}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {state?.user?.name ? 
                    state.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 
                    '??'
                  }
                </div>
              </div>
            </div>
          </div>

      {/* Breadcrumb */}
      <div className="px-6 py-2 border-t border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-2 text-sm">
          <Home className="w-4 h-4 text-gray-400" />
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-300">
            {language === 'ar' ? 'لوحة القيادة' : 'Dashboard'}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {language === 'ar' ? 'نظرة عامة' : 'Overview'}
          </span>
        </div>
      </div>
    </header>

    {/* Main Content Container */}
    <main className="p-6">
      <div className="px-0 pt-0">
        <ProcessGuideBanner guide={processGuides[resolveGuideKey(location.pathname)]} />
      </div>
      <div className="max-w-[1600px] mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'منصة الحوكمة الذكية' : 'Smart Governance Platform'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {language === 'ar' 
              ? 'نظام متقدم لإدارة الحوكمة والمخاطر والامتثال'
              : 'Advanced system for Governance, Risk, and Compliance management'}
          </p>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
          {children}
        </div>
      </div>
    </main>
      </div>
    </div>
  );
};

export default AdvancedShell;
