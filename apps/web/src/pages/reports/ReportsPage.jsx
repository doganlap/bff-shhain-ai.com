import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Eye, Calendar, Filter, TrendingUp, PieChart, FileText, Users, Shield, AlertTriangle } from 'lucide-react';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner, AnimatedProgress } from '../../components/Animation/InteractiveAnimationToolkit';
import { FeatureGate, useSubscription } from '../../components/Subscription/SubscriptionManager';
import apiService from '../../services/apiEndpoints';
import { useI18n } from '../../hooks/useI18n';

const ReportsPage = () => {
  const { hasFeature, currentPlan } = useSubscription();
  const { t, language, changeLanguage, isRTL } = useI18n();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState('all');


  // Generate new report
  const handleGenerateReport = async (reportType, params) => {
    try {
      setLoading(true);
      const response = await apiServices.reports.generate(reportType, params);
      if (response?.data?.success) {
        // Refresh reports list
        fetchReports();
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadReports();
  }, [language]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await apiService.reports.getRuns();
      setReports(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'compliance': return 'bg-blue-100 text-blue-800';
      case 'risk': return 'bg-red-100 text-red-800';
      case 'executive': return 'bg-purple-100 text-purple-800';
      case 'audit': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'compliance': return <Shield className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      case 'executive': return <TrendingUp className="h-4 w-4" />;
      case 'audit': return <FileText className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getTypeText = (type) => {
    const typeMap = {
      compliance: { en: 'Compliance', ar: 'امتثال' },
      risk: { en: 'Risk', ar: 'مخاطر' },
      executive: { en: 'Executive', ar: 'تنفيذي' },
      audit: { en: 'Audit', ar: 'تدقيق' }
    };
    return typeMap[type]?.[language] || type;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      completed: { en: 'Completed', ar: 'مكتمل' },
      generating: { en: 'Generating', ar: 'قيد الإنشاء' },
      failed: { en: 'Failed', ar: 'فشل' }
    };
    return statusMap[status]?.[language] || status;
  };

  const filteredReports = reports.filter(report => {
    if (filterBy === 'all') return true;
    return report.type === filterBy;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CulturalLoadingSpinner culturalStyle="modern" />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: language === 'ar' ? 'Amiri, Noto Sans Arabic, sans-serif' : 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <ArabicTextEngine
            animated={true}
            personalityType="professional"
            style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a202c', marginBottom: '8px' }}
          >
            {language === 'ar' ? 'التقارير' : 'Reports'}
          </ArabicTextEngine>
          <ArabicTextEngine
            personalityType="casual"
            style={{ fontSize: '16px', color: '#4a5568' }}
          >
            {language === 'ar' ? 'إنشاء وإدارة تقارير الامتثال والمخاطر' : 'Generate and manage compliance and risk reports'}
          </ArabicTextEngine>
        </div>

        <div className="flex items-center space-x-4">
          {/* Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{language === 'ar' ? 'جميع التقارير' : 'All Reports'}</option>
            <option value="compliance">{language === 'ar' ? 'تقارير الامتثال' : 'Compliance Reports'}</option>
            <option value="risk">{language === 'ar' ? 'تقارير المخاطر' : 'Risk Reports'}</option>
            <option value="executive">{language === 'ar' ? 'التقارير التنفيذية' : 'Executive Reports'}</option>
            <option value="audit">{language === 'ar' ? 'تقارير التدقيق' : 'Audit Reports'}</option>
          </select>

          {/* Generate Report */}
          <FeatureGate feature="basicReports">
            <AnimatedButton
              variant="primary"
              culturalStyle="modern"
              style={{ backgroundColor: '#667eea' }}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              <ArabicTextEngine personalityType="casual">
                {language === 'ar' ? 'إنشاء تقرير جديد' : 'Generate Report'}
              </ArabicTextEngine>
            </AnimatedButton>
          </FeatureGate>
        </div>
      </div>

      {/* Report Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedCard hover3D={true} culturalPattern={false}>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{reports.length}</div>
            <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px', color: '#6b7280' }}>
              {language === 'ar' ? 'إجمالي التقارير' : 'Total Reports'}
            </ArabicTextEngine>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={true} culturalPattern={false}>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {reports.filter(r => r.type === 'compliance').length}
            </div>
            <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px', color: '#6b7280' }}>
              {language === 'ar' ? 'تقارير الامتثال' : 'Compliance'}
            </ArabicTextEngine>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={true} culturalPattern={false}>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">
              {reports.filter(r => r.type === 'risk').length}
            </div>
            <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px', color: '#6b7280' }}>
              {language === 'ar' ? 'تقارير المخاطر' : 'Risk Reports'}
            </ArabicTextEngine>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={true} culturalPattern={false}>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {reports.filter(r => r.type === 'executive').length}
            </div>
            <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px', color: '#6b7280' }}>
              {language === 'ar' ? 'التقارير التنفيذية' : 'Executive'}
            </ArabicTextEngine>
          </div>
        </AnimatedCard>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <AnimatedCard key={report.id} hover3D={true} culturalPattern={true}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getTypeIcon(report.type)}
                    <ArabicTextEngine
                      personalityType="professional"
                      style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c' }}
                    >
                      {language === 'ar' ? report.titleAr : report.title}
                    </ArabicTextEngine>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getTypeColor(report.type)}`}>
                      {getTypeIcon(report.type)}
                      {getTypeText(report.type)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {getStatusText(report.status)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <ArabicTextEngine personalityType="casual">
                        {language === 'ar' ? report.organizationAr : report.organization}
                      </ArabicTextEngine>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <ArabicTextEngine personalityType="casual">
                        {language === 'ar' ? report.frameworkAr : report.framework}
                      </ArabicTextEngine>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{language === 'ar' ? 'تاريخ الإنشاء:' : 'Generated:'} {new Date(report.generatedDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Compliance Score */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px', color: '#6b7280' }}>
                        {language === 'ar' ? 'نقاط الامتثال' : 'Compliance Score'}
                      </ArabicTextEngine>
                      <span className="text-sm font-medium text-gray-900">{report.complianceScore}%</span>
                    </div>
                    <AnimatedProgress
                      value={report.complianceScore}
                      culturalStyle="modern"
                      style={{ height: '6px' }}
                    />
                  </div>

                  {/* Findings Summary */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="text-lg font-bold text-red-600">{report.criticalFindings}</div>
                      <ArabicTextEngine personalityType="casual" style={{ fontSize: '10px', color: '#dc2626' }}>
                        {language === 'ar' ? 'حرجة' : 'Critical'}
                      </ArabicTextEngine>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <div className="text-lg font-bold text-yellow-600">{report.mediumFindings}</div>
                      <ArabicTextEngine personalityType="casual" style={{ fontSize: '10px', color: '#d97706' }}>
                        {language === 'ar' ? 'متوسطة' : 'Medium'}
                      </ArabicTextEngine>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{report.lowFindings}</div>
                      <ArabicTextEngine personalityType="casual" style={{ fontSize: '10px', color: '#059669' }}>
                        {language === 'ar' ? 'منخفضة' : 'Low'}
                      </ArabicTextEngine>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{report.format}</span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <AnimatedButton
                  variant="outline"
                  size="small"
                  culturalStyle="modern"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px' }}>
                    {language === 'ar' ? 'معاينة' : 'Preview'}
                  </ArabicTextEngine>
                </AnimatedButton>

                {report.status === 'completed' && (
                  <FeatureGate feature="basicReports">
                    <AnimatedButton
                      variant="primary"
                      size="small"
                      culturalStyle="modern"
                      style={{ backgroundColor: '#48bb78' }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px' }}>
                        {language === 'ar' ? 'تحميل' : 'Download'}
                      </ArabicTextEngine>
                    </AnimatedButton>
                  </FeatureGate>
                )}

                {report.status === 'generating' && (
                  <div className="flex items-center px-3 py-1.5 text-sm text-yellow-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                    <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px' }}>
                      {language === 'ar' ? 'قيد الإنشاء...' : 'Generating...'}
                    </ArabicTextEngine>
                  </div>
                )}
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-12 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <ArabicTextEngine
              personalityType="friendly"
              style={{ fontSize: '18px', fontWeight: '600', color: '#4a5568', marginBottom: '8px' }}
            >
              {language === 'ar' ? 'لا توجد تقارير' : 'No reports found'}
            </ArabicTextEngine>
            <ArabicTextEngine
              personalityType="casual"
              style={{ fontSize: '14px', color: '#6b7280' }}
            >
              {language === 'ar' ? 'ابدأ بإنشاء تقرير جديد' : 'Start by generating a new report'}
            </ArabicTextEngine>
          </div>
        </AnimatedCard>
      )}

      {/* Premium Features Teaser */}
      {currentPlan === 'free' && (
        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <ArabicTextEngine
                  personalityType="professional"
                  style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a202c', marginBottom: '8px' }}
                >
                  {language === 'ar' ? 'ميزات التقارير المتقدمة' : 'Advanced Reporting Features'}
                </ArabicTextEngine>
                <ArabicTextEngine
                  personalityType="casual"
                  style={{ fontSize: '14px', color: '#4a5568', marginBottom: '12px' }}
                >
                  {language === 'ar' ?
                    'احصل على تقارير مخصصة، تحليلات متقدمة، وتصدير متعدد الصيغ' :
                    'Get custom reports, advanced analytics, and multi-format exports'}
                </ArabicTextEngine>
                <AnimatedButton
                  variant="primary"
                  size="small"
                  culturalStyle="modern"
                  style={{ backgroundColor: '#667eea' }}
                  onClick={() => window.location.href = '/app/subscription'}
                >
                  {language === 'ar' ? 'ترقية الآن' : 'Upgrade Now'}
                </AnimatedButton>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
        </AnimatedCard>
      )}
    </div>
  );
};

export default ReportsPage;
