import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Building, 
  ClipboardCheck, 
  BarChart3, 
  Settings, 
  LogOut,
  Shield,
  Globe,
  CreditCard
} from 'lucide-react';
import ArabicTextEngine from '../Arabic/ArabicTextEngine';
import { AnimatedButton } from '../Animation/InteractiveAnimationToolkit';
import { SubscriptionProvider, useSubscription, FeatureGate } from '../Subscription/SubscriptionManager';

const MainLayoutContent = () => {
  const location = useLocation();
  const [language, setLanguage] = useState('en');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { hasFeature, currentPlan } = useSubscription();

  const navigation = [
    { 
      name: 'Dashboard', 
      nameAr: 'لوحة التحكم',
      href: '/app/dashboard', 
      icon: Home,
      feature: null
    },
    { 
      name: 'Regulators', 
      nameAr: 'الجهات التنظيمية',
      href: '/app/regulators', 
      icon: Shield,
      feature: null
    },
    { 
      name: 'Organizations', 
      nameAr: 'المؤسسات',
      href: '/app/organizations', 
      icon: Building,
      feature: null
    },
    { 
      name: 'Assessments', 
      nameAr: 'التقييمات',
      href: '/app/assessments', 
      icon: ClipboardCheck,
      feature: 'basicAssessments'
    },
    { 
      name: 'Reports', 
      nameAr: 'التقارير',
      href: '/app/reports', 
      icon: BarChart3,
      feature: 'basicReports'
    },
    { 
      name: 'Settings', 
      nameAr: 'الإعدادات',
      href: '/app/settings', 
      icon: Settings,
      feature: null
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', language === 'en' ? 'rtl' : 'ltr');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" style={{ fontFamily: language === 'ar' ? 'Amiri, Noto Sans Arabic, sans-serif' : 'Inter, sans-serif' }}>
      {/* Top Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArabicTextEngine 
                  animated={true}
                  personalityType="professional"
                  style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}
                >
                  {language === 'ar' ? 'نظام الحوكمة والمخاطر والامتثال' : 'GRC Platform'}
                </ArabicTextEngine>
              </div>
              
              {/* Subscription Badge */}
              <div className="ml-4 px-3 py-1 bg-white bg-opacity-20 rounded-full">
                <span className="text-white text-xs font-medium">
                  {currentPlan === 'free' ? (language === 'ar' ? 'مجاني' : 'Free') : 
                   currentPlan === 'professional' ? (language === 'ar' ? 'احترافي' : 'Pro') : 
                   (language === 'ar' ? 'مؤسسي' : 'Enterprise')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <AnimatedButton
                variant="outline"
                size="small"
                onClick={toggleLanguage}
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  color: 'white', 
                  border: '1px solid rgba(255,255,255,0.3)' 
                }}
              >
                <Globe className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'English' : 'العربية'}
              </AnimatedButton>

              {/* Subscription Link */}
              <Link to="/app/subscription">
                <AnimatedButton
                  variant="outline"
                  size="small"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    color: 'white', 
                    border: '1px solid rgba(255,255,255,0.3)' 
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'الاشتراك' : 'Subscription'}
                </AnimatedButton>
              </Link>

              {/* Logout */}
              <AnimatedButton
                variant="outline"
                size="small"
                onClick={handleLogout}
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  color: 'white', 
                  border: '1px solid rgba(255,255,255,0.3)' 
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'خروج' : 'Logout'}
              </AnimatedButton>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside 
          className={`bg-white shadow-sm transition-all duration-300 flex-shrink-0 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
          style={{ 
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            borderRight: '1px solid #e2e8f0'
          }}
        >
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full p-2 hover:bg-gray-100 transition-colors flex items-center justify-center border-b border-gray-200"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg 
              className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <nav className="py-4 px-2">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const hasAccess = !item.feature || hasFeature(item.feature);
                
                return (
                  <div key={item.name}>
                    {hasAccess ? (
                      <Link to={item.href}>
                        <div
                          className={`flex items-center w-full px-3 py-2 rounded-md transition-colors cursor-pointer mb-1 ${
                            isActive ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          title={sidebarCollapsed ? (language === 'ar' ? item.nameAr : item.name) : ''}
                        >
                          <item.icon className={`h-5 w-5 flex-shrink-0 ${!sidebarCollapsed && 'mr-3'}`} />
                          {!sidebarCollapsed && (
                            <span className="text-sm font-medium">
                              {language === 'ar' ? item.nameAr : item.name}
                            </span>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <FeatureGate 
                        feature={item.feature} 
                        showUpgrade={false}
                        fallback={
                          <div className="relative">
                            <AnimatedButton
                              variant="outline"
                              size="medium"
                              disabled={true}
                              style={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                opacity: 0.5,
                                marginBottom: '4px'
                              }}
                            >
                              <item.icon className="h-5 w-5 mr-3" />
                              <ArabicTextEngine 
                                personalityType="casual"
                                style={{ fontSize: '14px' }}
                              >
                                {language === 'ar' ? item.nameAr : item.name}
                              </ArabicTextEngine>
                              <span className="ml-auto text-xs">🔒</span>
                            </AnimatedButton>
                          </div>
                        }
                      >
                        <Link to={item.href}>
                          <div
                            className={`flex items-center w-full px-3 py-2 rounded-md transition-colors cursor-pointer mb-1 ${
                              isActive ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            title={sidebarCollapsed ? (language === 'ar' ? item.nameAr : item.name) : ''}
                          >
                            <item.icon className={`h-5 w-5 flex-shrink-0 ${!sidebarCollapsed && 'mr-3'}`} />
                            {!sidebarCollapsed && (
                              <span className="text-sm font-medium">
                                {language === 'ar' ? item.nameAr : item.name}
                              </span>
                            )}
                          </div>
                        </Link>
                      </FeatureGate>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Upgrade Prompt for Free Users */}
            {currentPlan === 'free' && !sidebarCollapsed && (
              <div className="mx-2 mt-4 p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <p className="text-xs font-semibold text-gray-800 mb-1">
                  {language === 'ar' ? 'ترقية للميزات المتقدمة' : 'Upgrade'}
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  {language === 'ar' ? 'الذكاء الاصطناعي' : 'AI Features'}
                </p>
                <Link to="/app/subscription">
                  <button className="w-full px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-colors">
                    {language === 'ar' ? 'ترقية' : 'Upgrade'}
                  </button>
                </Link>
              </div>
            )}
          </nav>
        </aside>

        {/* Main content - takes full remaining width with no gap */}
        <main className="flex-1 overflow-x-hidden">
          <div className="h-full p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const MainLayout = () => {
  return (
    <SubscriptionProvider>
      <MainLayoutContent />
    </SubscriptionProvider>
  );
};

export default MainLayout;
