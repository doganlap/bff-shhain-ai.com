/**
 * Enhanced App Shell with all modern features
 * Demonstrates i18n, RTL, tooltips, theme switching, and interactive components
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Settings, Menu, X, Search, Bell, HelpCircle, ChevronLeft, ChevronRight, UserCheck, Globe } from 'lucide-react';

// Import our new components
import ErrorBoundary from '../common/ErrorBoundary';
import { Toaster } from 'sonner';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../hooks/useI18n.jsx';
import { useTheme } from '../theme/ThemeProvider';
import { Tooltip, InfoTooltip, WarningTooltip } from '../ui/Tooltip';
import { Modal, Dropdown, Select, Alert } from '../ui/InteractiveComponents';
import { getNavigationForRole, TenantSelector, RoleBadge } from './MultiTenantNavigation';
import { apiServices } from '../../services/api';

const EnhancedAppShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useApp();
  const { user } = state;
  const { t, language, changeLanguage, isRTL } = useI18n();
  const { isDark } = useTheme();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Multi-tenant navigation
  const userRole = user?.role || 'team_member'; // platform_admin, tenant_admin, team_member
  const tenantContext = user?.tenant || { id: 1, name: 'Default Organization', compliance: 85 };
  const navigationItems = getNavigationForRole(userRole, tenantContext);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentPath = location.pathname;

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // Language options
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' }
  ];

  // Load real notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const response = await apiServices.notifications.getAll({ 
          limit: 10, 
          unread_only: true,
          user_id: user?.id 
        });
        const notificationsData = response.data || response || [];
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    if (user?.id) {
      loadNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  return (
    <ErrorBoundary>
      <div className={`flex h-screen transition-colors duration-200 ${
        isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'
      }`} dir={isRTL() ? 'rtl' : 'ltr'}>

        {/* Mobile Menu Toggle */}
        {isMobile && (
          <Tooltip content={t('action.open')} position="bottom">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`fixed top-4 ${isRTL() ? 'right-4' : 'left-4'} z-50 p-2 rounded-lg shadow-lg hover:shadow-xl transition-all ${
                isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              }`}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </Tooltip>
        )}

        {/* Enhanced Sidebar */}
        <AnimatePresence>
          {(!isMobile || mobileMenuOpen) && (
            <motion.aside
              initial={isMobile ? { x: isRTL() ? 300 : -300 } : { width: 280 }}
              animate={isMobile ? { x: 0 } : { width: sidebarCollapsed ? 80 : 280 }}
              exit={isMobile ? { x: isRTL() ? 300 : -300 } : {}}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`${
                isMobile ? 'fixed' : 'relative'
              } top-0 ${isRTL() ? 'right-0' : 'left-0'} h-full shadow-xl z-40 overflow-hidden ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
              } border-${isRTL() ? 'l' : 'r'}`}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-slate-200'}`}>
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
                          <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {t('company.name')}
                          </h1>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                            {t('company.tagline')}
                          </p>
                        </div>
                      </motion.div>
                    )}
                    {!isMobile && (
                      <Tooltip content={sidebarCollapsed ? t('action.open') : t('action.close')} position="right">
                        <button
                          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className={`p-1 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-gray-700' : 'hover:bg-slate-100'
                          }`}
                        >
                          {sidebarCollapsed ?
                            (isRTL() ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) :
                            (isRTL() ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />)
                          }
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* User Info & Role Badge */}
                {!sidebarCollapsed && user && (
                  <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-slate-200'} space-y-3`}>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-slate-100'}`}>
                        <UserCheck className={`h-4 w-4 ${isDark ? 'text-gray-300' : 'text-slate-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {user.first_name} {user.last_name}
                        </p>
                        <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <RoleBadge role={userRole} />
                    {userRole === 'platform_admin' && <TenantSelector />}
                  </div>
                )}

                {/* Navigation - Multi-Tenant with Collapsible Sections */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  {navigationItems.map((section) => {
                    const Icon = section.icon;
                    const hasChildren = section.items && section.items.length > 0;
                    const isActive = section.path && (currentPath === section.path || currentPath.startsWith(section.path + '/'));

                    if (!hasChildren && section.path) {
                      // Simple navigation item
                      const navButton = (
                        <motion.button
                          key={section.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleNavigation(section.path)}
                          className={`w-full flex items-center ${
                            sidebarCollapsed ? 'justify-center' : 'justify-between'
                          } px-3 py-2 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                              : isDark
                              ? 'hover:bg-gray-700 text-gray-300'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            {!sidebarCollapsed && (
                              <span className="text-sm font-medium">{section.name}</span>
                            )}
                          </div>
                          {!sidebarCollapsed && section.badge && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {section.badge}
                            </span>
                          )}
                        </motion.button>
                      );

                      return sidebarCollapsed ? (
                        <Tooltip key={section.id} content={section.name} position="right">
                          {navButton}
                        </Tooltip>
                      ) : navButton;
                    }

                    if (hasChildren && !sidebarCollapsed) {
                      // Section with children
                      return (
                        <div key={section.id} className="mb-4">
                          <div className={`flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                            isDark ? 'text-gray-400' : 'text-slate-500'
                          }`}>
                            <div className="flex items-center space-x-2">
                              <Icon className="h-4 w-4" />
                              <span>{section.name}</span>
                            </div>
                          </div>
                          <div className="space-y-1 mt-2">
                            {section.items.map((child) => {
                              const ChildIcon = child.icon;
                              const isChildActive = child.path && (currentPath === child.path || currentPath.startsWith(child.path + '/'));

                              return (
                                <motion.button
                                  key={child.id}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleNavigation(child.path)}
                                  className={`w-full flex items-center justify-between pl-6 pr-3 py-2 rounded-lg transition-all duration-200 ${
                                    isChildActive
                                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                                      : isDark
                                      ? 'hover:bg-gray-700 text-gray-300'
                                      : 'hover:bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <ChildIcon className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-sm">{child.name}</span>
                                  </div>
                                  {child.badge && (
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                      isChildActive ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {child.badge}
                                    </span>
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}
                </nav>

                {/* Footer with Theme & Language Controls */}
                <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-slate-200'}`}>
                  {!sidebarCollapsed ? (
                    <div className="space-y-3">


                      {/* Language Selector */}
                      <Select
                        options={languageOptions}
                        value={language}
                        onChange={changeLanguage}
                        className="w-full text-sm"
                      />

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-slate-500'}`}
                      >
                        <p>GRC Master Platform</p>
                        <p>Version 2.0.0</p>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Tooltip content="Language" position="right">
                        <button
                          onClick={() => changeLanguage(language === 'en' ? 'ar' : 'en')}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <Globe className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          isMobile ? '' : sidebarCollapsed ? (isRTL() ? 'mr-20' : 'ml-20') : (isRTL() ? 'mr-72' : 'ml-72')
        }`}>
          {/* Enhanced Top Header */}
          <header className={`h-16 flex items-center justify-between px-6 border-b ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center space-x-4">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {navigationItems.find(item => currentPath === item.path || currentPath.startsWith(item.path + '/'))?.name || t('nav.dashboard')}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <InfoTooltip content={t('action.search')} position="bottom">
                <button className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-slate-100 text-slate-600'
                }`}>
                  <Search className="h-4 w-4" />
                </button>
              </InfoTooltip>

              {/* Notifications */}
              <Dropdown
                trigger={
                  <button className={`p-2 rounded-lg transition-colors relative ${
                    isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-slate-100 text-slate-600'
                  }`}>
                    <Bell className="h-4 w-4" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                }
                position="bottom-end"
                contentClassName="w-auto min-w-80 max-w-sm"
              >
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Notifications</h3>
                  {notificationsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-4">
                      <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No new notifications</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <Alert
                          key={notification.id}
                          type={notification.type || 'info'}
                          title={notification.title}
                          className="text-sm"
                        >
                          <p>{notification.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {notification.created_at ? new Date(notification.created_at).toLocaleTimeString() : notification.time}
                          </p>
                        </Alert>
                      ))}
                    </div>
                  )}
                </div>
              </Dropdown>

              {/* Settings */}
              <Tooltip content={t('nav.settings')} position="bottom">
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                </button>
              </Tooltip>

              {/* Help */}
              <WarningTooltip content="Help & Support" position="bottom">
                <button className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-slate-100 text-slate-600'
                }`}>
                  <HelpCircle className="h-4 w-4" />
                </button>
              </WarningTooltip>
            </div>
          </header>

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

        {/* Settings Modal */}
        <Modal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          title={t('nav.settings')}
          size="md"
        >
          <div className="p-6 space-y-6">
            <Alert type="info" title="Settings Panel">
              This is a demonstration of the modal component with theme and i18n support.
            </Alert>

            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <Select
                  options={languageOptions}
                  value={language}
                  onChange={changeLanguage}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('action.close')}
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('action.save')}
              </button>
            </div>
          </div>
        </Modal>

        {/* Toast Notifications */}
        <Toaster
          position={isRTL() ? "top-left" : "top-right"}
          richColors
          closeButton
        />
      </div>
    </ErrorBoundary>
  );
};

export default EnhancedAppShell;
