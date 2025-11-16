import React, { useState, useEffect, useCallback } from 'react';
import { Settings, User, Bell, Shield, Palette, Save, Key, Mail, Phone } from 'lucide-react';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import { AnimatedCard, AnimatedButton } from '../../components/Animation/InteractiveAnimationToolkit';
 
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../hooks/useI18n.jsx';
import { useTheme } from '../../components/theme/ThemeProvider';
import apiService from '@/services/apiEndpoints';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { state } = useApp();
  const { language, changeLanguage } = useI18n();
  const { isDark, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({});
  
  // Fetch real settings from API
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  const fetchSettings = useCallback(async () => {
    try {
      const response = await apiService.settings.get();
      if (response?.data?.success && response.data.data) {
        setSettings(response.data.data);
      } else {
        // Use user data from context as fallback
        setSettings({
          firstName: state?.user?.first_name || '',
          lastName: state?.user?.last_name || '',
          email: state?.user?.email || '',
          phone: state?.user?.phone || '',
          jobTitle: state?.user?.job_title || '',
          organization: state?.user?.organization || '',
          
          // Default notification settings
          emailNotifications: true,
          smsNotifications: false,
          assessmentReminders: true,
          complianceAlerts: true,
          reportGeneration: true,
          systemUpdates: false,
          
          // Default security settings
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordExpiry: 90,
          
          // Default appearance settings
          theme: isDark ? 'dark' : 'light',
          language: language,
          dateFormat: 'DD/MM/YYYY',
          timezone: 'Asia/Riyadh',
          
          // Default system settings
          autoSave: true,
          dataRetention: 365,
          exportFormat: 'PDF'
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    }
  }, [isDark, language, state?.user]);
  
  // Save settings to API
  const handleSaveSettings = async () => {
    try {
      const response = await apiService.settings.update(settings);
      if (response?.data?.success) {
        toast.success('Settings saved successfully');
        
        // Apply theme and language changes
        if (settings.theme !== (isDark ? 'dark' : 'light')) {
          toggleTheme();
        }
        if (settings.language !== language) {
          changeLanguage(settings.language);
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    changeLanguage(savedLanguage);
    setSettings(prev => ({ ...prev, language: savedLanguage }));
  }, [changeLanguage]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    document.documentElement.setAttribute('dir', newLanguage === 'ar' ? 'rtl' : 'ltr');
    handleSettingChange('language', newLanguage);
  };

  

  const tabs = [
    { id: 'profile', label: 'Profile', labelAr: 'الملف الشخصي', icon: User },
    { id: 'notifications', label: 'Notifications', labelAr: 'الإشعارات', icon: Bell },
    { id: 'security', label: 'Security', labelAr: 'الأمان', icon: Shield },
    { id: 'appearance', label: 'Appearance', labelAr: 'المظهر', icon: Palette },
    { id: 'system', label: 'System', labelAr: 'النظام', icon: Settings }
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: language === 'ar' ? 'Amiri, Noto Sans Arabic, sans-serif' : 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <ArabicTextEngine 
            animated={true}
            personalityType="professional"
            style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a202c', marginBottom: '8px' }}
          >
            {language === 'ar' ? 'الإعدادات' : 'Settings'}
          </ArabicTextEngine>
          <ArabicTextEngine 
            personalityType="casual"
            style={{ fontSize: '16px', color: '#4a5568' }}
          >
            {language === 'ar' ? 'إدارة تفضيلات حسابك والنظام' : 'Manage your account and system preferences'}
          </ArabicTextEngine>
        </div>
        
        <AnimatedButton
          variant="primary"
          culturalStyle="modern"
          style={{ backgroundColor: '#667eea' }}
          onClick={handleSaveSettings}
        >
          <Save className="h-4 w-4 mr-2" />
          <ArabicTextEngine personalityType="casual">
            {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
          </ArabicTextEngine>
        </AnimatedButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <AnimatedCard hover3D={false} culturalPattern={false}>
            <div className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-3" />
                    <ArabicTextEngine personalityType="casual">
                      {language === 'ar' ? tab.labelAr : tab.label}
                    </ArabicTextEngine>
                  </button>
                ))}
              </nav>
            </div>
          </AnimatedCard>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <AnimatedCard hover3D={false} culturalPattern={true}>
            <div className="p-6">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <ArabicTextEngine 
                    personalityType="professional"
                    style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}
                  >
                    {language === 'ar' ? 'معلومات الملف الشخصي' : 'Profile Information'}
                  </ArabicTextEngine>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ArabicTextEngine personalityType="casual">
                          {language === 'ar' ? 'الاسم الأول' : 'First Name'}
                        </ArabicTextEngine>
                      </label>
                      <input
                        type="text"
                        value={language === 'ar' ? settings.firstNameAr : settings.firstName}
                        onChange={(e) => handleSettingChange(language === 'ar' ? 'firstNameAr' : 'firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ArabicTextEngine personalityType="casual">
                          {language === 'ar' ? 'اسم العائلة' : 'Last Name'}
                        </ArabicTextEngine>
                      </label>
                      <input
                        type="text"
                        value={language === 'ar' ? settings.lastNameAr : settings.lastName}
                        onChange={(e) => handleSettingChange(language === 'ar' ? 'lastNameAr' : 'lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ArabicTextEngine personalityType="casual">
                          {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                        </ArabicTextEngine>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          value={settings.email}
                          onChange={(e) => handleSettingChange('email', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ArabicTextEngine personalityType="casual">
                          {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                        </ArabicTextEngine>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          value={settings.phone}
                          onChange={(e) => handleSettingChange('phone', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ArabicTextEngine personalityType="casual">
                          {language === 'ar' ? 'المسمى الوظيفي' : 'Job Title'}
                        </ArabicTextEngine>
                      </label>
                      <input
                        type="text"
                        value={language === 'ar' ? settings.jobTitleAr : settings.jobTitle}
                        onChange={(e) => handleSettingChange(language === 'ar' ? 'jobTitleAr' : 'jobTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ArabicTextEngine personalityType="casual">
                          {language === 'ar' ? 'المؤسسة' : 'Organization'}
                        </ArabicTextEngine>
                      </label>
                      <input
                        type="text"
                        value={language === 'ar' ? settings.organizationAr : settings.organization}
                        onChange={(e) => handleSettingChange(language === 'ar' ? 'organizationAr' : 'organization', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <ArabicTextEngine 
                    personalityType="professional"
                    style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}
                  >
                    {language === 'ar' ? 'إعدادات الإشعارات' : 'Notification Preferences'}
                  </ArabicTextEngine>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', labelAr: 'إشعارات البريد الإلكتروني' },
                      { key: 'smsNotifications', label: 'SMS Notifications', labelAr: 'إشعارات الرسائل النصية' },
                      { key: 'assessmentReminders', label: 'Assessment Reminders', labelAr: 'تذكيرات التقييم' },
                      { key: 'complianceAlerts', label: 'Compliance Alerts', labelAr: 'تنبيهات الامتثال' },
                      { key: 'reportGeneration', label: 'Report Generation', labelAr: 'إنشاء التقارير' },
                      { key: 'systemUpdates', label: 'System Updates', labelAr: 'تحديثات النظام' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <ArabicTextEngine personalityType="casual" style={{ fontSize: '16px', color: '#1a202c' }}>
                          {language === 'ar' ? item.labelAr : item.label}
                        </ArabicTextEngine>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings[item.key]}
                            onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <ArabicTextEngine 
                    personalityType="professional"
                    style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}
                  >
                    {language === 'ar' ? 'إعدادات الأمان' : 'Security Settings'}
                  </ArabicTextEngine>
                  
                  <div className="space-y-6">
                    {/* Two-Factor Authentication */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <ArabicTextEngine personalityType="casual" style={{ fontSize: '16px', color: '#1a202c', marginBottom: '4px' }}>
                          {language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}
                        </ArabicTextEngine>
                        <p className="text-sm text-gray-600">
                          {language === 'ar' ? 'إضافة طبقة حماية إضافية لحسابك' : 'Add an extra layer of security to your account'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.twoFactorAuth}
                          onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Session Timeout */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ArabicTextEngine personalityType="casual">
                          {language === 'ar' ? 'انتهاء مهلة الجلسة (بالدقائق)' : 'Session Timeout (minutes)'}
                        </ArabicTextEngine>
                      </label>
                      <select
                        value={settings.sessionTimeout}
                        onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={15}>15 {language === 'ar' ? 'دقيقة' : 'minutes'}</option>
                        <option value={30}>30 {language === 'ar' ? 'دقيقة' : 'minutes'}</option>
                        <option value={60}>60 {language === 'ar' ? 'دقيقة' : 'minutes'}</option>
                        <option value={120}>120 {language === 'ar' ? 'دقيقة' : 'minutes'}</option>
                      </select>
                    </div>

                    {/* Password Expiry */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ArabicTextEngine personalityType="casual">
                          {language === 'ar' ? 'انتهاء صلاحية كلمة المرور (بالأيام)' : 'Password Expiry (days)'}
                        </ArabicTextEngine>
                      </label>
                      <select
                        value={settings.passwordExpiry}
                        onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={30}>30 {language === 'ar' ? 'يوم' : 'days'}</option>
                        <option value={60}>60 {language === 'ar' ? 'يوم' : 'days'}</option>
                        <option value={90}>90 {language === 'ar' ? 'يوم' : 'days'}</option>
                        <option value={180}>180 {language === 'ar' ? 'يوم' : 'days'}</option>
                      </select>
                    </div>

                    {/* Change Password */}
                    <div className="pt-4 border-t border-gray-200">
                      <AnimatedButton
                        variant="outline"
                        culturalStyle="modern"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        <ArabicTextEngine personalityType="casual">
                          {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                        </ArabicTextEngine>
                      </AnimatedButton>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <ArabicTextEngine 
                    personalityType="professional"
                    style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}
                  >
                    {language === 'ar' ? 'إعدادات المظهر' : 'Appearance Settings'}
                  </ArabicTextEngine>
                  
                  <div className="space-y-6">
                    {/* Language */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ArabicTextEngine personalityType="casual">
                          {language === 'ar' ? 'اللغة' : 'Language'}
                        </ArabicTextEngine>
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                      </select>
                    </div>

                    {/* Theme */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ArabicTextEngine personalityType="casual">
                          {language === 'ar' ? 'المظهر' : 'Theme'}
                        </ArabicTextEngine>
                      </label>
                      <select
                        value={settings.theme}
                        onChange={(e) => handleSettingChange('theme', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="light">{language === 'ar' ? 'فاتح' : 'Light'}</option>
                        <option value="dark">{language === 'ar' ? 'داكن' : 'Dark'}</option>
                        <option value="auto">{language === 'ar' ? 'تلقائي' : 'Auto'}</option>
                      </select>
                    </div>

                    {/* Date Format */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ArabicTextEngine personalityType="casual">
                          {language === 'ar' ? 'تنسيق التاريخ' : 'Date Format'}
                        </ArabicTextEngine>
                      </label>
                      <select
                        value={settings.dateFormat}
                        onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    {/* Timezone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ArabicTextEngine personalityType="casual">
                          {language === 'ar' ? 'المنطقة الزمنية' : 'Timezone'}
                        </ArabicTextEngine>
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Asia/Riyadh">{language === 'ar' ? 'الرياض' : 'Riyadh'}</option>
                        <option value="Asia/Dubai">{language === 'ar' ? 'دبي' : 'Dubai'}</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">New York</option>
                        <option value="Europe/London">London</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* System Settings */}
              {activeTab === 'system' && (
                <div className="space-y-6">
                  <ArabicTextEngine 
                    personalityType="professional"
                    style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}
                  >
                    {language === 'ar' ? 'إعدادات النظام' : 'System Settings'}
                  </ArabicTextEngine>
                  
                  <div className="space-y-6">
                    {/* Auto Save */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <ArabicTextEngine personalityType="casual" style={{ fontSize: '16px', color: '#1a202c', marginBottom: '4px' }}>
                          {language === 'ar' ? 'الحفظ التلقائي' : 'Auto Save'}
                        </ArabicTextEngine>
                        <p className="text-sm text-gray-600">
                          {language === 'ar' ? 'حفظ التغييرات تلقائياً أثناء العمل' : 'Automatically save changes while working'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoSave}
                          onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Data Retention */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ArabicTextEngine personalityType="casual">
                          {language === 'ar' ? 'الاحتفاظ بالبيانات (بالأيام)' : 'Data Retention (days)'}
                        </ArabicTextEngine>
                      </label>
                      <select
                        value={settings.dataRetention}
                        onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={90}>90 {language === 'ar' ? 'يوم' : 'days'}</option>
                        <option value={180}>180 {language === 'ar' ? 'يوم' : 'days'}</option>
                        <option value={365}>365 {language === 'ar' ? 'يوم' : 'days'}</option>
                        <option value={730}>730 {language === 'ar' ? 'يوم' : 'days'}</option>
                      </select>
                    </div>

                    {/* Export Format */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ArabicTextEngine personalityType="casual">
                          {language === 'ar' ? 'تنسيق التصدير الافتراضي' : 'Default Export Format'}
                        </ArabicTextEngine>
                      </label>
                      <select
                        value={settings.exportFormat}
                        onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="PDF">PDF</option>
                        <option value="Excel">Excel</option>
                        <option value="CSV">CSV</option>
                        <option value="JSON">JSON</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;