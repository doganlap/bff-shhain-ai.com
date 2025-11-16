import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, FileText, Target, CheckCircle, Activity,
  Globe, Building2, RefreshCw, Award, Search
} from 'lucide-react';
 
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner } from '../../components/Animation/InteractiveAnimationToolkit';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';

const KSAGRCPage = () => {
  const [activeTab, setActiveTab] = useState('regulator-rules');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('ar'); // Default to Arabic for KSA
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  // KSA GRC Statistics
  const [ksaStats, setKsaStats] = useState({
    totalRegulators: 0,
    activeFrameworks: 0,
    complianceRules: 0,
    evidenceRequirements: 0
  });

  const fetchTabData = useCallback(async (tab) => {
    try {
      setLoading(true);
      const response = await apiService.regulatory.getKSAData(tab, {
        search: searchTerm,
        filter: filterBy !== 'all' ? filterBy : undefined
      });
      if (response?.data?.success && response.data.data) {
        setData(prevData => ({ ...prevData, [tab]: response.data.data }));
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);
      toast.error(`Failed to load ${tab} data`);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterBy]);

  const fetchKSAStats = useCallback(async () => {
    try {
      const response = await apiService.regulatory.getKSAStats();
      if (response?.data?.success && response.data.data) {
        setKsaStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching KSA stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchTabData(activeTab);
    fetchKSAStats();
    const savedLanguage = localStorage.getItem('language') || 'ar';
    setLanguage(savedLanguage);
  }, [activeTab, fetchTabData, fetchKSAStats]);

  

  const tabs = [
    { id: 'regulator-rules', name: language === 'ar' ? 'القوانين التنظيمية' : 'Regulator Rules', icon: Shield },
    { id: 'framework-versions', name: language === 'ar' ? 'إصدارات الأطر' : 'Framework Versions', icon: Target },
    { id: 'control-requirements', name: language === 'ar' ? 'متطلبات الضوابط' : 'Control Requirements', icon: CheckCircle },
    { id: 'evidence', name: language === 'ar' ? 'الأدلة' : 'Evidence', icon: FileText },
    { id: 'validation', name: language === 'ar' ? 'التحقق' : 'Validation', icon: Activity },
    { id: 'scopes', name: language === 'ar' ? 'النطاقات' : 'Scopes', icon: Globe }
  ];

  if (loading && !data[activeTab]) {
    return (
      <div className="flex justify-center items-center h-64">
        <CulturalLoadingSpinner culturalStyle="modern" />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: language === 'ar' ? 'Amiri, Noto Sans Arabic, sans-serif' : 'Inter, sans-serif' }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Award className="h-8 w-8 text-green-600" />
            {language === 'ar' ? 'حوكمة المملكة العربية السعودية' : 'Kingdom of Saudi Arabia GRC'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 
              'نظام إدارة المخاطر والامتثال والحوكمة للمملكة العربية السعودية' : 
              'Governance, Risk, and Compliance system for Kingdom of Saudi Arabia'
            }
          </p>
        </div>

        <div className="flex items-center gap-4">
          <AnimatedButton
            variant="outline"
            culturalStyle="modern"
            onClick={() => fetchTabData(activeTab)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'تحديث' : 'Refresh'}
          </AnimatedButton>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedCard hover3D={true} culturalPattern={false}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                {language === 'ar' ? 'الجهات التنظيمية' : 'Total Regulators'}
              </h3>
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {ksaStats.totalRegulators}
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={true} culturalPattern={false}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                {language === 'ar' ? 'الأطر النشطة' : 'Active Frameworks'}
              </h3>
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {ksaStats.activeFrameworks}
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={true} culturalPattern={false}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                {language === 'ar' ? 'قواعد الامتثال' : 'Compliance Rules'}
              </h3>
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {ksaStats.complianceRules}
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={true} culturalPattern={false}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                {language === 'ar' ? 'متطلبات الأدلة' : 'Evidence Requirements'}
              </h3>
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {ksaStats.evidenceRequirements}
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Tabs and Content */}
      <AnimatedCard>
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 rtl:left-auto rtl:right-3" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 rtl:pl-4 rtl:pr-10"
                style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
              />
            </div>
            
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
              <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
              <option value="pending">{language === 'ar' ? 'معلق' : 'Pending'}</option>
              <option value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</option>
            </select>
          </div>

          {/* Tab Content */}
          {loading ? (
            <div className="flex justify-center py-8">
              <CulturalLoadingSpinner culturalStyle="modern" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              {data[activeTab] && data[activeTab].length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {Object.keys(data[activeTab][0] || {}).map((key) => (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rtl:text-right"
                        >
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {data[activeTab].map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        {Object.values(item).map((value, cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">
                    {language === 'ar' ? 'لا توجد بيانات متاحة' : 'No data available'}
                  </p>
                  <p className="text-gray-400">
                    {language === 'ar' ? 'لم يتم العثور على بيانات لهذا القسم' : 'No data found for this section'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default KSAGRCPage;
