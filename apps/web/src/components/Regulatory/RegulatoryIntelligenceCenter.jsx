/**
 * Regulatory Intelligence Center - Main Component
 * Provides real-time regulatory monitoring and compliance calendar
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, AlertCircle, Calendar, Filter, RefreshCw, 
  TrendingUp, Building2, FileText, Download, Languages, Globe 
} from 'lucide-react';
import RegulatoryFeedWidget from './RegulatoryFeedWidget';
import ComplianceCalendarWidget from './ComplianceCalendarWidget';
import ImpactAssessmentModal from './ImpactAssessmentModal';
import { regulatorsApi } from '../../services/regulatorsApi';
import apiService from '../../services/apiEndpoints';
import { translationAPI, translationUtils } from '../../services/translationApi';
import { useI18n } from '../../hooks/useI18n';

const RegulatoryIntelligenceCenter = () => {
  const { t, isRTL, language, changeLanguage } = useI18n();
  const [changes, setChanges] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedRegulator, setSelectedRegulator] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedChange, setSelectedChange] = useState(null);
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [error, setError] = useState(null);

  const regulators = [
    { id: 'all', name: 'All Regulators', nameAr: 'جميع الجهات' },
    { id: 'SAMA', name: 'SAMA', nameAr: 'البنك المركزي السعودي' },
    { id: 'NCA', name: 'NCA', nameAr: 'الهيئة الوطنية للأمن السيبراني' },
    { id: 'MOH', name: 'MOH', nameAr: 'وزارة الصحة' },
    { id: 'ZATCA', name: 'ZATCA', nameAr: 'هيئة الزكاة والضريبة' },
    { id: 'SDAIA', name: 'SDAIA', nameAr: 'الهيئة السعودية للبيانات' },
    { id: 'CMA', name: 'CMA', nameAr: 'هيئة السوق المالية' }
  ];

  useEffect(() => {
    loadData();
  }, [selectedRegulator, language]);

  useEffect(() => {
    // Load calendar events separately
    loadCalendarEvents();
  }, [language]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load regulatory changes from real API
      const changesResponse = await regulatorsApi.getRegulatoryChanges(
        selectedRegulator === 'all' ? null : selectedRegulator,
        { 
          language: language,
          include_translations: true,
          limit: 50
        }
      );
      
      let regulatoryChanges = changesResponse.data || changesResponse || [];
      
      // Apply translations if needed
      if (language !== 'ar' && regulatoryChanges.length > 0) {
        setTranslationLoading(true);
        try {
          regulatoryChanges = await Promise.all(
            regulatoryChanges.map(async (change) => {
              if (!change.translations || !change.translations[language]) {
                return await translationAPI.translateRegulatoryChange(change, language);
              }
              return change;
            })
          );
        } catch (translationError) {
          console.warn('Translation failed, using original content:', translationError);
        } finally {
          setTranslationLoading(false);
        }
      }
      
      setChanges(regulatoryChanges);

      // Load statistics from real API
      const statsResponse = await regulatorsApi.getRegulatoryStats();
      setStats(statsResponse.data || statsResponse || {
        total_changes: regulatoryChanges.length,
        critical_changes: regulatoryChanges.filter(c => c.urgency_level === 'critical').length,
        changes_last_week: regulatoryChanges.filter(c => {
          const changeDate = new Date(c.published_date || c.created_at);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return changeDate > weekAgo;
        }).length,
        changes_last_month: regulatoryChanges.filter(c => {
          const changeDate = new Date(c.published_date || c.created_at);
          const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return changeDate > monthAgo;
        }).length
      });
      
    } catch (error) {
      console.error('Error loading regulatory data:', error);
      setError(error.message || 'Failed to load regulatory data');
      
      // Fallback to mock data if API fails
      setChanges(generateMockRegulatoryChanges());
      setStats({
        total_changes: 24,
        critical_changes: 3,
        changes_last_week: 7,
        changes_last_month: 18
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarEvents = async () => {
    try {
      const eventsResponse = await regulatorsApi.getComplianceCalendar({
        language: language,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      });
      setCalendarEvents(eventsResponse.data || eventsResponse || []);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      setCalendarEvents(generateMockCalendarEvents());
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleViewImpact = async (change) => {
    try {
      // Load detailed impact assessment
      const impactResponse = await regulatorsApi.getImpactAssessment(change.id);
      const changeWithImpact = {
        ...change,
        impact_assessment: impactResponse.data || impactResponse
      };
      setSelectedChange(changeWithImpact);
      setShowImpactModal(true);
    } catch (error) {
      console.error('Error loading impact assessment:', error);
      // Show modal with basic change data if impact assessment fails
      setSelectedChange(change);
      setShowImpactModal(true);
    }
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar';
    changeLanguage(newLanguage);
  };

  const handleSubscribeToUpdates = async (regulatorId) => {
    try {
      await regulatorsApi.subscribeToUpdates({
        regulator_id: regulatorId,
        notification_types: ['critical', 'high'],
        delivery_method: 'email'
      });
      // Show success message
      console.log('Successfully subscribed to updates');
    } catch (error) {
      console.error('Error subscribing to updates:', error);
    }
  };

  const filteredChanges = changes.filter(change => {
    if (selectedUrgency !== 'all' && change.urgency_level !== selectedUrgency) {
      return false;
    }
    return true;
  });

  const urgencyColors = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300'
  };

  // Mock data generators for fallback
  const generateMockRegulatoryChanges = () => [
    {
      id: '1',
      title: language === 'ar' ? 'تحديث لوائح البنك المركزي السعودي' : 'SAMA Banking Regulations Update',
      description: language === 'ar' ? 'تحديثات جديدة على لوائح الخدمات المصرفية' : 'New updates to banking services regulations',
      regulator: 'SAMA',
      urgency_level: 'high',
      published_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      id: '2', 
      title: language === 'ar' ? 'إرشادات الأمن السيبراني الجديدة' : 'New Cybersecurity Guidelines',
      description: language === 'ar' ? 'إرشادات محدثة للأمن السيبراني من الهيئة الوطنية' : 'Updated cybersecurity guidelines from NCA',
      regulator: 'NCA',
      urgency_level: 'critical',
      published_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    }
  ];

  const generateMockCalendarEvents = () => [
    {
      id: '1',
      title: language === 'ar' ? 'موعد تقديم التقرير السنوي' : 'Annual Report Submission',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      regulator: 'SAMA',
      type: 'deadline'
    }
  ];

  if (error && !changes.length) {
    return (
      <div className={`min-h-screen bg-gray-50 p-6 flex items-center justify-center ${isRTL() ? 'rtl' : 'ltr'}`}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('message.error')}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            {t('action.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 p-6 ${isRTL() ? 'rtl' : 'ltr'}`} dir={isRTL() ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="w-8 h-8 text-indigo-600" />
              {language === 'ar' ? 'مركز الذكاء التنظيمي' : 'Regulatory Intelligence Center'}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'ar' ? 'Regulatory Intelligence Center' : 'مركز الذكاء التنظيمي'}
            </p>
            {translationLoading && (
              <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                <Languages className="w-4 h-4 animate-pulse" />
                {t('message.loading')} {language === 'ar' ? 'الترجمة...' : 'Translation...'}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLanguageToggle}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
              <Globe className="w-4 h-4" />
              {language === 'ar' ? 'EN' : 'العربية'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'إجمالي التغييرات' : 'Total Changes'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_changes || 0}</p>
              </div>
              <FileText className="w-10 h-10 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'تغييرات حرجة' : 'Critical Changes'}
                </p>
                <p className="text-2xl font-bold text-red-600">{stats.critical_changes || 0}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'هذا الأسبوع' : 'This Week'}
                </p>
                <p className="text-2xl font-bold text-blue-600">{stats.changes_last_week || 0}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'هذا الشهر' : 'This Month'}
                </p>
                <p className="text-2xl font-bold text-green-600">{stats.changes_last_month || 0}</p>
              </div>
              <Calendar className="w-10 h-10 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {language === 'ar' ? 'تصفية:' : 'Filters:'}
            </span>
          </div>

          {/* Regulator Filter */}
          <select
            value={selectedRegulator}
            onChange={(e) => setSelectedRegulator(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {regulators.map(reg => (
              <option key={reg.id} value={reg.id}>
                {language === 'ar' ? `${reg.nameAr} - ${reg.name}` : `${reg.name} - ${reg.nameAr}`}
              </option>
            ))}
          </select>

          {/* Urgency Filter */}
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">
              {language === 'ar' ? 'جميع المستويات' : 'All Levels'}
            </option>
            <option value="critical">
              {language === 'ar' ? 'حرج' : 'Critical'}
            </option>
            <option value="high">
              {language === 'ar' ? 'عالي' : 'High'}
            </option>
            <option value="medium">
              {language === 'ar' ? 'متوسط' : 'Medium'}
            </option>
            <option value="low">
              {language === 'ar' ? 'منخفض' : 'Low'}
            </option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regulatory Feed - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RegulatoryFeedWidget 
            changes={filteredChanges} 
            loading={loading}
            onViewImpact={handleViewImpact}
            urgencyColors={urgencyColors}
          />
        </div>

        {/* Compliance Calendar - Takes 1 column */}
        <div>
          <ComplianceCalendarWidget 
            events={calendarEvents}
            language={language}
            loading={loading}
          />
        </div>
      </div>

      {/* Impact Assessment Modal */}
      {showImpactModal && selectedChange && (
        <ImpactAssessmentModal
          change={selectedChange}
          onClose={() => {
            setShowImpactModal(false);
            setSelectedChange(null);
          }}
        />
      )}
    </div>
  );
};

export default RegulatoryIntelligenceCenter;

