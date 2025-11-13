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
    window.location.href = '/login';
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

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen" style={{ 
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRight: '1px solid #e2e8f0'
        }}>
          <nav className="mt-5 px-3">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const hasAccess = !item.feature || hasFeature(item.feature);
                
                return (
                  <div key={item.name}>
                    {hasAccess ? (
                      <Link to={item.href}>
                        <AnimatedButton
                          variant={isActive ? 'primary' : 'outline'}
                          size="medium"
                          culturalStyle="modern"
                          style={{
                            width: '100%',
                            justifyContent: 'flex-start',
                            backgroundColor: isActive ? '#667eea' : 'transparent',
                            color: isActive ? 'white' : '#4a5568',
                            border: isActive ? 'none' : '1px solid #e2e8f0',
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
                        </AnimatedButton>
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
                          <AnimatedButton
                            variant={isActive ? 'primary' : 'outline'}
                            size="medium"
                            culturalStyle="modern"
                            style={{
                              width: '100%',
                              justifyContent: 'flex-start',
                              backgroundColor: isActive ? '#667eea' : 'transparent',
                              color: isActive ? 'white' : '#4a5568',
                              border: isActive ? 'none' : '1px solid #e2e8f0',
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
                          </AnimatedButton>
                        </Link>
                      </FeatureGate>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Upgrade Prompt for Free Users */}
            {currentPlan === 'free' && (
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <ArabicTextEngine 
                  personalityType="friendly"
                  style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}
                >
                  {language === 'ar' ? 'ترقية للميزات المتقدمة' : 'Upgrade for Advanced Features'}
                </ArabicTextEngine>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                  {language === 'ar' ? 'احصل على الذكاء الاصطناعي والميزات المتقدمة' : 'Get AI features and advanced capabilities'}
                </p>
                <Link to="/app/subscription">
                  <AnimatedButton
                    variant="primary"
                    size="small"
                    culturalStyle="modern"
                    style={{ width: '100%', fontSize: '12px' }}
                  >
                    {language === 'ar' ? 'ترقية الآن' : 'Upgrade Now'}
                  </AnimatedButton>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
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
