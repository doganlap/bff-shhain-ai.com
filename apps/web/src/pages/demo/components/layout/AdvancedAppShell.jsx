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
import { getNavigationForRole, RoleActivationPanel } from './MultiTenantNavigation';
import ProcessGuideBanner from '../guidance/ProcessGuideBanner';
import { processGuides, resolveGuideKey } from '../../config/processGuides';

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
  const [advancedUiEnabled, setAdvancedUiEnabled] = useState(() => {
    try { return localStorage.getItem('enable_advanced_ui') === 'true'; } catch { return false; }
  });
  const [aiConnected, setAiConnected] = useState(false);
  const [aiLatency, setAiLatency] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    try {
      const pref = localStorage.getItem('enable_advanced_ui');
      setAdvancedUiEnabled(pref === 'true');
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const existing = localStorage.getItem('enable_advanced_ui');
      if (existing === null) {
        const r = String(user?.role || '').toLowerCase();
        const isAdmin = ['platform_admin','admin','super_admin','tenant_admin','organization_admin','org_admin','owner','tenant_owner','organization_owner'].includes(r);
        const defVal = isAdmin ? 'true' : 'false';
        localStorage.setItem('enable_advanced_ui', defVal);
        setAdvancedUiEnabled(defVal === 'true');
      }
    } catch {}
  }, [user?.role]);

  useEffect(() => {
    const checkAi = async () => {
      const start = performance.now();
      try {
        const res = await fetch('/api/ai/health');
        setAiConnected(res.ok);
        setAiLatency(Math.round(performance.now() - start));
      } catch {
        setAiConnected(false);
        setAiLatency(null);
      }
    };
    checkAi();
    const id = setInterval(checkAi, 30000);
    return () => clearInterval(id);
  }, []);

  const userRole = user?.role || 'team_member';
  const tenantContext = user?.tenant || { id: 1, name: 'Default Organization' };
  const navigationItems = getNavigationForRole(userRole, tenantContext, state.stats);

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
          isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'
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

                <div className="px-4 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    {['All','GRC','Team','Platform'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setSelectedCategory(tab)}
                        className={`px-3 py-1.5 rounded-lg text-sm ${selectedCategory===tab ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  {(selectedCategory==='All' ? navigationItems : navigationItems.filter(s => s.category===selectedCategory)).map((section) => {
                    const SectionIcon = section.icon;
                    const hasChildren = Array.isArray(section.items) && section.items.length > 0;
                    const sectionActive = section.path && (currentPath === section.path || currentPath.startsWith(section.path + '/'));

                    if (!hasChildren && section.path) {
                      return (
                        <motion.button
                          key={section.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleNavigation(section.path)}
                          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-lg transition-all duration-200 ${
                            sectionActive ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'hover:bg-white/50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <SectionIcon className="h-5 w-5 flex-shrink-0" />
                            {!sidebarCollapsed && (
                              <span className="text-sm font-medium">{getDisplayName(section)}</span>
                            )}
                          </div>
                          {!sidebarCollapsed && section.badge && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{section.badge}</span>
                          )}
                        </motion.button>
                      );
                    }

                    if (hasChildren && !sidebarCollapsed) {
                      return (
                        <div key={section.id} className="mb-4">
                          <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <div className="flex items-center space-x-2">
                              <SectionIcon className="h-4 w-4" />
                              <span>{getDisplayName(section)}</span>
                            </div>
                          </div>
                          <div className="space-y-1 mt-2">
                            {section.items.map((child) => {
                              const ChildIcon = child.icon;
                              const childActive = child.path && (currentPath === child.path || currentPath.startsWith(child.path + '/'));
                              return (
                                <motion.button
                                  key={child.id}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleNavigation(child.path)}
                                  className={`w-full flex items-center justify-between pl-6 pr-3 py-2 rounded-lg transition-all duration-200 ${
                                    childActive ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'hover:bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <ChildIcon className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-sm">{getDisplayName(child)}</span>
                                  </div>
                                  {child.badge && (
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${childActive ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-800'}`}>{child.badge}</span>
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
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {(() => {
                  const currentItem = navigationItems.find(item => currentPath === item.path || currentPath.startsWith(item.path + '/'));
                  const label = currentItem ? getDisplayName(currentItem) : (language === 'ar' ? 'لوحة القيادة' : 'Dashboard');
                  return label;
                })()}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Advanced UI</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={advancedUiEnabled}
                    onChange={(e) => {
                      const next = e.target.checked;
                      try { localStorage.setItem('enable_advanced_ui', String(next)); } catch {}
                      setAdvancedUiEnabled(next);
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <select
                value={currentTheme}
                onChange={(e) => setTheme(e.target.value)}
                className="px-2 py-1 text-xs border rounded-lg"
              >
                {Object.keys(themes).map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              {userRole === 'platform_admin' && (
                <div className="w-auto-responsive min-w-[12rem]">
                  <RoleActivationPanel 
                    role={userRole} 
                    currentTenant={state.currentTenant} 
                    tenants={[]} 
                    onTenantSwitch={(tenant)=>{}}
                  />
                </div>
              )}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setNavigatorOpen(true)}
                type="button"
                aria-label={language === 'ar' ? 'مستكشف الصفحات المتقدم' : 'Advanced Page Navigator'}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 relative group focus:outline-none focus:ring-2 focus:ring-primary-600"
                title={language === 'ar' ? 'مستكشف الصفحات المتقدم' : 'Advanced Page Navigator'}
              >
                <Grid3X3 className="h-4 w-4 text-slate-600 group-hover:text-primary-600" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-3 w-3 bg-primary-500 rounded-full flex items-center justify-center"
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
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg">
                <span className={`h-2 w-2 rounded-full ${aiConnected ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                <span className="text-xs text-slate-600">AI{aiLatency!==null ? ` ${aiLatency}ms` : ''}</span>
              </div>
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

        <div className="px-6 pt-3">
          <ProcessGuideBanner guide={processGuides[resolveGuideKey(currentPath)]} />
        </div>

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
        {/* Role Activation Panel */}
        <div className="px-6 py-3 border-t border-slate-200">
          <RoleActivationPanel role={userRole} currentTenant={state.currentTenant} tenants={[]} onTenantSwitch={(tenant)=>{}} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdvancedAppShell;
