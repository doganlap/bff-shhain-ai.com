import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, Calendar, Clock,
  Target, Activity, BarChart3, Eye, Download,
  AlertCircle, Shield, RefreshCw, Search, Bell, Edit, Info, Archive
} from 'lucide-react';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner } from '../../components/Animation/InteractiveAnimationToolkit';
import { regulatorsApi } from '../../services/regulatorsApi';
import apiService from '../../services/apiEndpoints';
 
import { useI18n } from '../../hooks/useI18n';

const RegulatoryIntelligenceEnginePage = () => {
  const { language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monitoring');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  

  // Regulatory Intelligence statistics
  const [regulatoryStats, setRegulatoryStats] = useState({
    totalRegulations: 0,
    activeMonitoring: 0,
    pendingUpdates: 0,
    criticalAlerts: 0,
    complianceScore: 0,
    lastUpdateCheck: 'Never'
  });

  const [regulations, setRegulations] = useState([]);
  const [complianceCalendar, setComplianceCalendar] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const loadRegulatoryData = useCallback(async () => {
    setLoading(true);
    try {
      // Load real regulatory data from APIs
      const [regulationsRes, calendarRes, alertsRes, statsRes] = await Promise.all([
        regulatorsApi.getRegulatoryChanges(null, { 
          language: language,
          include_translations: true,
          detailed: true
        }),
        regulatorsApi.getComplianceCalendar({ 
          language: language,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        }),
        apiService.notifications.getAll({ 
          type: 'regulatory',
          language: language
        }),
        regulatorsApi.getRegulatoryStats()
      ]);

      // Process regulations data
      let regulationsData = regulationsRes.data || regulationsRes || [];
      
      // Apply translations if needed
  if (language !== 'ar' && regulationsData.length > 0) {
        // Skip dynamic translation to reduce complexity
  }

      setRegulations(regulationsData);
      setComplianceCalendar(calendarRes.data || calendarRes || []);
      setAlerts(alertsRes.data || alertsRes || []);
      
      // Update statistics
      const stats = statsRes.data || statsRes || {};
      setRegulatoryStats({
        totalRegulations: regulationsData.length,
        activeMonitoring: regulationsData.filter(r => r.status === 'active').length,
        pendingUpdates: regulationsData.filter(r => r.status === 'pending').length,
        criticalAlerts: (alertsRes.data || alertsRes || []).filter(a => a.severity === 'critical').length,
        complianceScore: stats.average_compliance_score || 0,
        lastUpdateCheck: new Date().toLocaleString()
      });
      
    } catch (error) {
      console.error('Error loading regulatory data:', error);
      
      // Fallback to empty data instead of mock data
      setRegulations([]);
      setComplianceCalendar([]);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    loadRegulatoryData();
  }, [loadRegulatoryData]);

  

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-red-600 bg-red-50 border-red-200',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200'
    };
    return colors[severity] || colors.medium;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority] || colors.medium;
  };

  const filteredRegulations = regulations.filter(reg => {
    const matchesFilter = filterBy === 'all' || reg.category === filterBy;
    const matchesSearch = !searchTerm ||
      (reg.title && (
        (reg.title.en && reg.title.en.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reg.title.ar && reg.title.ar.includes(searchTerm)) ||
        (reg.title[language] && reg.title[language].toLowerCase().includes(searchTerm.toLowerCase()))
      )) ||
      (reg.authority && (
        (reg.authority.en && reg.authority.en.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reg.authority.ar && reg.authority.ar.includes(searchTerm)) ||
        (reg.authority[language] && reg.authority[language].toLowerCase().includes(searchTerm.toLowerCase()))
      )) ||
      (reg.name && reg.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reg.regulator && reg.regulator.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const renderMonitoringTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <AnimatedCard className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                <ArabicTextEngine
                  text={language === 'ar' ? 'إجمالي اللوائح' : 'Total Regulations'}
                  language={language}
                />
              </p>
              <p className="text-2xl font-bold text-gray-900">{regulatoryStats.totalRegulations}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                <ArabicTextEngine
                  text={language === 'ar' ? 'المراقبة النشطة' : 'Active Monitoring'}
                  language={language}
                />
              </p>
              <p className="text-2xl font-bold text-green-600">{regulatoryStats.activeMonitoring}</p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                <ArabicTextEngine
                  text={language === 'ar' ? 'التحديثات المعلقة' : 'Pending Updates'}
                  language={language}
                />
              </p>
              <p className="text-2xl font-bold text-orange-600">{regulatoryStats.pendingUpdates}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                <ArabicTextEngine
                  text={language === 'ar' ? 'تنبيهات حرجة' : 'Critical Alerts'}
                  language={language}
                />
              </p>
              <p className="text-2xl font-bold text-red-600">{regulatoryStats.criticalAlerts}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                <ArabicTextEngine
                  text={language === 'ar' ? 'درجة الامتثال' : 'Compliance Score'}
                  language={language}
                />
              </p>
              <p className="text-2xl font-bold text-blue-600">{regulatoryStats.complianceScore}%</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                <ArabicTextEngine
                  text={language === 'ar' ? 'آخر فحص' : 'Last Check'}
                  language={language}
                />
              </p>
              <p className="text-sm font-medium text-gray-900">{regulatoryStats.lastUpdateCheck}</p>
            </div>
            <RefreshCw className="h-8 w-8 text-gray-500" />
          </div>
        </AnimatedCard>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث في اللوائح...' : 'Search regulations...'}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="all">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
            <option value="banking">{language === 'ar' ? 'البنوك' : 'Banking'}</option>
            <option value="data_privacy">{language === 'ar' ? 'حماية البيانات' : 'Data Privacy'}</option>
            <option value="capital_markets">{language === 'ar' ? 'أسواق رأس المال' : 'Capital Markets'}</option>
          </select>
          
        </div>
      </div>

      {/* Regulations List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            <ArabicTextEngine text={language === 'ar' ? 'اللوائح المراقبة' : 'Monitored Regulations'} language={language} />
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredRegulations.map((regulation) => (
            <AnimatedCard key={regulation.id} className="p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className={`px-2 py-1 text-xs font-medium rounded-md border ${getSeverityColor(regulation.severity)}`}>
                      {regulation.severity.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        <ArabicTextEngine text={regulation.title[language]} language={language} />
                      </h4>
                      <p className="text-sm text-gray-600 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        <ArabicTextEngine text={regulation.authority[language]} language={language} />
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          <ArabicTextEngine
                            text={language === 'ar' ? `آخر تحديث: ${regulation.lastUpdated}` : `Last Updated: ${regulation.lastUpdated}`}
                            language={language}
                          />
                        </span>
                        <span>
                          <ArabicTextEngine
                            text={language === 'ar' ? `المراجعة القادمة: ${regulation.nextReview}` : `Next Review: ${regulation.nextReview}`}
                            language={language}
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      <ArabicTextEngine
                        text={language === 'ar' ? 'الامتثال' : 'Compliance'}
                        language={language}
                      />
                    </div>
                    <div className={`text-lg font-bold ${regulation.compliance >= 90 ? 'text-green-600' : regulation.compliance >= 80 ? 'text-orange-600' : 'text-red-600'}`}>
                      {regulation.compliance}%
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              {regulation.changes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-orange-700">
                      <ArabicTextEngine
                        text={language === 'ar' ? 'تغييرات حديثة:' : 'Recent Changes:'}
                        language={language}
                      />
                    </span>
                    <span className="text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <ArabicTextEngine text={regulation.changes[0].description[language]} language={language} />
                    </span>
                  </div>
                </div>
              )}
            </AnimatedCard>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCalendarTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <ArabicTextEngine text={language === 'ar' ? 'تقويم الامتثال' : 'Compliance Calendar'} language={language} />
        </h3>
        <div className="space-y-4">
          {complianceCalendar.map((event) => (
            <AnimatedCard key={event.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-2 ${getPriorityColor(event.priority)}`}></div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        <ArabicTextEngine text={event.title[language]} language={language} />
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <ArabicTextEngine
                          text={language === 'ar' ? `السلطة: ${event.authority}` : `Authority: ${event.authority}`}
                          language={language}
                        />
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        <ArabicTextEngine
                          text={language === 'ar' ? `التاريخ: ${event.date}` : `Date: ${event.date}`}
                          language={language}
                        />
                      </p>
                    </div>
                    <div className={`px-2 py-1 text-xs font-medium rounded-md ${
                      event.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      event.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.priority.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAlertsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            <ArabicTextEngine text={language === 'ar' ? 'التنبيهات الذكية' : 'Smart Alerts'} language={language} />
          </h3>
          
        </div>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AnimatedCard key={alert.id} className={`p-4 border rounded-lg ${alert.read ? 'bg-gray-50' : 'bg-white border-blue-200'}`}>
              <div className="flex items-start gap-3">
                <div className={`p-1 rounded-full ${
                  alert.severity === 'critical' ? 'bg-red-100' :
                  alert.severity === 'warning' ? 'bg-orange-100' :
                  'bg-blue-100'
                }`}>
                  {alert.severity === 'critical' ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : alert.severity === 'warning' ? (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${alert.read ? 'text-gray-600' : 'text-gray-900'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <ArabicTextEngine text={alert.title[language]} language={language} />
                  </h4>
                  <p className="text-sm text-gray-600 mt-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <ArabicTextEngine text={alert.description[language]} language={language} />
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!alert.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Archive className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard className="p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <ArabicTextEngine text={language === 'ar' ? 'اتجاهات الامتثال' : 'Compliance Trends'} language={language} />
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p><ArabicTextEngine text={language === 'ar' ? 'مخطط اتجاهات الامتثال' : 'Compliance Trends Chart'} language={language} /></p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <ArabicTextEngine text={language === 'ar' ? 'توزيع المخاطر' : 'Risk Distribution'} language={language} />
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto mb-2" />
              <p><ArabicTextEngine text={language === 'ar' ? 'مخطط توزيع المخاطر' : 'Risk Distribution Chart'} language={language} /></p>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );

  const tabs = [
    { id: 'monitoring', label: language === 'ar' ? 'المراقبة' : 'Monitoring', icon: Shield },
    { id: 'calendar', label: language === 'ar' ? 'التقويم' : 'Calendar', icon: Calendar },
    { id: 'alerts', label: language === 'ar' ? 'التنبيهات' : 'Alerts', icon: Bell },
    { id: 'analytics', label: language === 'ar' ? 'التحليلات' : 'Analytics', icon: BarChart3 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CulturalLoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <ArabicTextEngine text={language === 'ar' ? 'محرك الذكاء التنظيمي' : 'Regulatory Intelligence Engine'} language={language} />
              </h1>
              <p className="text-gray-600 mt-2">
                <ArabicTextEngine
                  text={language === 'ar' ? 'مراقبة وتتبع التغييرات التنظيمية للمملكة العربية السعودية' : 'KSA regulatory change monitoring and compliance tracking'}
                  language={language}
                />
              </p>
            </div>
            <div className="flex items-center gap-4">
              
              <AnimatedButton
                onClick={loadRegulatoryData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <ArabicTextEngine text={language === 'ar' ? 'تحديث' : 'Refresh'} language={language} />
              </AnimatedButton>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200 rounded-t-lg">
          <nav className="flex space-x-8 px-6" dir="ltr">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <ArabicTextEngine text={tab.label} language={language} />
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg min-h-[600px] p-6">
          {activeTab === 'monitoring' && renderMonitoringTab()}
          {activeTab === 'calendar' && renderCalendarTab()}
          {activeTab === 'alerts' && renderAlertsTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </div>
      </div>
    </div>
  );
};

export default RegulatoryIntelligenceEnginePage;
