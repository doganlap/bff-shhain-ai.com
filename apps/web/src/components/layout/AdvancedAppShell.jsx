import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Shield, Target, FileText, Building2, Users, BarChart3, Database, Settings, Menu, X, Search, Bell, MessageSquare, HelpCircle, ChevronLeft, ChevronRight, Bot, Eye, AlertTriangle, UserCheck, Archive, Activity, CheckCircle, Workflow, ShieldCheck, Grid3X3, Zap, Star } from 'lucide-react';
import ErrorBoundary from '../common/ErrorBoundary';
import { Toaster } from 'sonner';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../hooks/useI18n.jsx';
import { useTheme } from '../theme/ThemeProvider';
import ModernSlideNavigator from '../Navigation/ModernSlideNavigator';

const AdvancedAppShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useApp();
  const { user } = state;
  const { language, isRTL, t } = useI18n();
  const { isDark } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Navigation items - filtered by available routes
  const navigationItems = [
    { id: 'dashboard', name: 'لوحة القيادة', nameEn: 'Dashboard', icon: Home, path: '/advanced' },
    { id: 'assessments', name: 'التقييمات', nameEn: 'Assessments', icon: Shield, path: '/advanced/assessments' },
    { id: 'workflow-simulator', name: 'تجربة سير عمل مباشر', nameEn: 'Try a Live Workflow', icon: Workflow, path: '/advanced/workflow-simulator' },
    { id: 'frameworks', name: 'الأطر التنظيمية', nameEn: 'Frameworks', icon: Target, path: '/advanced/frameworks' },
    { id: 'navigator', name: 'مستكشف الصفحات', nameEn: 'Page Navigator', icon: Grid3X3, path: '#navigator', special: true },
    { id: 'controls', name: 'الضوابط', nameEn: 'Controls', icon: FileText, path: '/app/controls' },
    { id: 'organizations', name: 'المؤسسات', nameEn: 'Organizations', icon: Building2, path: '/app/organizations' },
    { id: 'regulators', name: 'الجهات التنظيمية', nameEn: 'Regulators', icon: Users, path: '/app/regulators' },
    { id: 'reports', name: 'التقارير', nameEn: 'Reports', icon: BarChart3, path: '/app/reports' },
    { id: 'database', name: 'قاعدة البيانات', nameEn: 'Database', icon: Database, path: '/app/database' },
    { id: 'settings', name: 'الإعدادات', nameEn: 'Settings', icon: Settings, path: '/app/settings' }
  ];

  const currentPath = location.pathname;

  const handleNavigation = (path, item) => {
    if (item?.special && item.id === 'navigator') {
      setNavigatorOpen(true);
    } else {
      navigate(path);
    }
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // Get display name based on current language
  const getDisplayName = (item) => {
    return language === 'ar' ? item.name : item.nameEn;
  };

  return (
    <ErrorBoundary>
      <div 
        className={`flex h-screen transition-colors duration-200 ${
          isDark() ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'
        }`}
        dir={isRTL() ? 'rtl' : 'ltr'}
      >
        {/* Mobile Menu Toggle */}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}

        {/* Advanced Sidebar with Glassmorphic Design */}
        <AnimatePresence>
          {(!isMobile || mobileMenuOpen) && (
            <motion.aside
              initial={isMobile ? { x: -300 } : { width: 'auto' }}
              animate={isMobile ? { x: 0 } : { width: sidebarCollapsed ? 'auto' : 'auto' }}
              exit={isMobile ? { x: -300 } : {}}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`${
                isMobile ? 'fixed' : 'relative'
              } top-0 left-0 h-full backdrop-blur-xl bg-white/90 border-r border-white/20 shadow-2xl z-40 overflow-hidden ${
                sidebarCollapsed ? 'w-20' : 'w-64 sm:w-72'
              }`}
              style={{
                background: isDark() 
                  ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)'
              }}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    {!sidebarCollapsed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center space-x-3"
                      >
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h1 className="text-lg font-bold text-slate-900">GRC Platform</h1>
                          <p className="text-xs text-slate-500">Advanced Dashboard</p>
                        </div>
                      </motion.div>
                    )}
                    {!isMobile && (
                      <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* User Info */}
                {!sidebarCollapsed && user && (
                  <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-100 rounded-full">
                        <UserCheck className="h-4 w-4 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
                    
                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNavigation(item.path, item)}
                        className={`w-full flex items-center ${
                          sidebarCollapsed ? 'justify-center' : 'justify-start'
                        } space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                            : item.special
                              ? 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white text-purple-600 border border-purple-200'
                              : 'hover:bg-white/50 hover:backdrop-blur-sm text-slate-700 hover:shadow-md'
                        }`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {!sidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            className="text-sm font-medium"
                          >
                            {getDisplayName(item)}
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200">
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-slate-500 text-center"
                    >
                      <p>GRC Master Platform</p>
                      <p>Version 2.0.0</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col ${isMobile ? '' : sidebarCollapsed ? 'ml-20' : 'ml-64 sm:ml-72'} transition-all duration-300`}>
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h2 className={`text-xl font-semibold ${isDark() ? 'text-white' : 'text-slate-900'}`}>
                {(() => {
                  const currentItem = navigationItems.find(item => currentPath === item.path || currentPath.startsWith(item.path + '/'));
                  return currentItem ? getDisplayName(currentItem) : (language === 'ar' ? 'لوحة القيادة' : 'Dashboard');
                })()}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setNavigatorOpen(true)}
                className="p-2 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white rounded-lg transition-all duration-200 relative group"
                title={language === 'ar' ? 'مستكشف الصفحات المتقدم' : 'Advanced Page Navigator'}
              >
                <Grid3X3 className="h-4 w-4 text-slate-600 group-hover:text-white" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                >
                  <Star className="h-2 w-2 text-white" />
                </motion.span>
              </motion.button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Search className="h-4 w-4 text-slate-600" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
                <Bell className="h-4 w-4 text-slate-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <HelpCircle className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </header>

          {/* Global Offline Banner */}
          {state.isOffline && (
            <div className="bg-yellow-500 text-white text-center p-2 text-sm font-semibold">
              You are in Offline Mode. Data may not be up to date.
            </div>
          )}

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>

        {/* Mobile Overlay */}
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Toast Notifications */}
        <Toaster
          position={isRTL() ? 'top-left' : 'top-right'}
          richColors
          closeButton
        />

        {/* Modern Slide Navigator */}
        <ModernSlideNavigator 
          isOpen={navigatorOpen}
          onClose={() => setNavigatorOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
};

export default AdvancedAppShell;
