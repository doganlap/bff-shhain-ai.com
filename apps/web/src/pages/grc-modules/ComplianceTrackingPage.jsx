import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp, Target, AlertCircle, BarChart3, Filter, Calendar } from 'lucide-react';
import apiService from '../../services/apiEndpoints';
import { useI18n } from '../../hooks/useI18n';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner, AnimatedProgress } from '../../components/Animation/InteractiveAnimationToolkit';

const ComplianceTrackingPage = () => {
  const { t, language, isRTL } = useI18n();
  const [complianceData, setComplianceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [complianceStats, setComplianceStats] = useState({
    overallScore: 0,
    totalGaps: 0,
    criticalGaps: 0,
    completedTasks: 0
  });
  const [filterBy, setFilterBy] = useState('all');

  // Sample compliance data
  const sampleComplianceData = [
    {
      id: 1,
      framework: 'SAMA Cybersecurity Framework',
      frameworkAr: 'إطار الأمن السيبراني لساما',
      organization: 'Al Rajhi Bank',
      organizationAr: 'مصرف الراجحي',
      overallScore: 92,
      totalControls: 156,
      compliantControls: 143,
      nonCompliantControls: 8,
      inProgressControls: 5,
      lastAssessment: '2024-01-15',
      nextAssessment: '2024-04-15',
      status: 'compliant',
      riskLevel: 'low',
      trends: {
        previousScore: 88,
        improvement: 4
      }
    },
    {
      id: 2,
      framework: 'ISO 27001:2013',
      frameworkAr: 'ISO 27001:2013',
      organization: 'SABIC',
      organizationAr: 'سابك',
      overallScore: 87,
      totalControls: 114,
      compliantControls: 99,
      nonCompliantControls: 12,
      inProgressControls: 3,
      lastAssessment: '2024-01-12',
      nextAssessment: '2024-07-12',
      status: 'compliant',
      riskLevel: 'medium',
      trends: {
        previousScore: 85,
        improvement: 2
      }
    },
    {
      id: 3,
      framework: 'NIST Cybersecurity Framework',
      frameworkAr: 'إطار الأمن السيبراني NIST',
      organization: 'Saudi Aramco',
      organizationAr: 'أرامكو السعودية',
      overallScore: 95,
      totalControls: 208,
      compliantControls: 197,
      nonCompliantControls: 6,
      inProgressControls: 5,
      lastAssessment: '2024-01-10',
      nextAssessment: '2024-06-10',
      status: 'compliant',
      riskLevel: 'low',
      trends: {
        previousScore: 94,
        improvement: 1
      }
    },
    {
      id: 4,
      framework: 'PCI DSS',
      frameworkAr: 'PCI DSS',
      organization: 'National Commercial Bank',
      organizationAr: 'البنك الأهلي التجاري',
      overallScore: 76,
      totalControls: 78,
      compliantControls: 59,
      nonCompliantControls: 15,
      inProgressControls: 4,
      lastAssessment: '2024-01-08',
      nextAssessment: '2024-03-08',
      status: 'non-compliant',
      riskLevel: 'high',
      trends: {
        previousScore: 72,
        improvement: 4
      }
    }
  ];

  const complianceMetrics = [
    {
      name: 'متوسط الامتثال',
      nameEn: 'Average Compliance',
      value: '87.5%',
      icon: Target,
      color: 'blue',
      change: '+2.3%'
    },
    {
      name: 'الأطر المتوافقة',
      nameEn: 'Compliant Frameworks',
      value: 3,
      icon: CheckCircle,
      color: 'green',
      change: '+1'
    },
    {
      name: 'تحتاج تحسين',
      nameEn: 'Need Improvement',
      value: 1,
      icon: AlertCircle,
      color: 'yellow',
      change: '-1'
    },
    {
      name: 'إجمالي الضوابط',
      nameEn: 'Total Controls',
      value: 556,
      icon: BarChart3,
      color: 'purple',
      change: '+45'
    }
  ];

  useEffect(() => {
    loadComplianceData();
  }, [language]);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load real compliance data from APIs
      const [complianceRes, gapsRes, tasksRes, scoreRes] = await Promise.all([
        apiService.frameworks.getAll({ include_compliance: true }),
        apiService.compliance.getGaps(),
        apiService.compliance.getTasks({ status: 'all' }),
        apiService.compliance.getScore()
      ]);
      
      // Process compliance data
      const frameworks = complianceRes.data || complianceRes || [];
      const gaps = gapsRes.data || gapsRes || [];
      const tasks = tasksRes.data || tasksRes || [];
      const scoreData = scoreRes.data || scoreRes || {};
      
      // Transform data for the component
      const processedData = frameworks.map(framework => ({
        id: framework.id,
        name: framework.name,
        description: framework.description,
        compliance_score: framework.compliance_score || 0,
        total_controls: framework.total_controls || 0,
        implemented_controls: framework.implemented_controls || 0,
        gaps: gaps.filter(gap => gap.framework_id === framework.id),
        last_assessment: framework.last_assessment,
        next_assessment: framework.next_assessment,
        status: framework.status || 'active'
      }));
      
      setComplianceData(processedData);
      
      // Update statistics
      setComplianceStats({
        overallScore: scoreData.overall_score || 0,
        totalGaps: gaps.length,
        criticalGaps: gaps.filter(gap => gap.severity === 'critical').length,
        completedTasks: tasks.filter(task => task.status === 'completed').length
      });
      
    } catch (error) {
      console.error('Error loading compliance data:', error);
      setError(error.message || 'Failed to load compliance data');
      setComplianceData([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredData = complianceData.filter(item => {
    if (filterBy === 'all') return true;
    return item.status === filterBy;
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
            {language === 'ar' ? 'متابعة الامتثال' : 'Compliance Tracking'}
          </ArabicTextEngine>
          <ArabicTextEngine
            personalityType="casual"
            style={{ fontSize: '16px', color: '#4a5568' }}
          >
            {language === 'ar' ? 'مراقبة ومتابعة حالة الامتثال للأطر التنظيمية' : 'Monitor and track compliance status across regulatory frameworks'}
          </ArabicTextEngine>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
            <option value="compliant">{language === 'ar' ? 'متوافق' : 'Compliant'}</option>
            <option value="non-compliant">{language === 'ar' ? 'غير متوافق' : 'Non-Compliant'}</option>
            <option value="in-progress">{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</option>
          </select>
        </div>
      </div>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {complianceMetrics.map((metric, index) => (
          <AnimatedCard key={index} hover3D={false} culturalPattern={true}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    <ArabicTextEngine personalityType="casual">
                      {language === 'ar' ? metric.name : metric.nameEn}
                    </ArabicTextEngine>
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                  <p className="text-sm text-green-600 mt-1">{metric.change} this quarter</p>
                </div>
                <div className={`p-3 rounded-full bg-${metric.color}-100`}>
                  <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
                </div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Compliance Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredData.map((item) => (
          <AnimatedCard key={item.id} hover3D={false} culturalPattern={true}>
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    <ArabicTextEngine personalityType="professional">
                      {language === 'ar' ? item.frameworkAr : item.framework}
                    </ArabicTextEngine>
                  </h3>
                  <p className="text-sm text-gray-600">
                    <ArabicTextEngine personalityType="casual">
                      {language === 'ar' ? item.organizationAr : item.organization}
                    </ArabicTextEngine>
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(item.riskLevel)}`}>
                    {item.riskLevel} risk
                  </span>
                </div>
              </div>

              {/* Compliance Score */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'نقاط الامتثال' : 'Compliance Score'}
                  </span>
                  <span className={`text-2xl font-bold ${getScoreColor(item.overallScore)}`}>
                    {item.overallScore}%
                  </span>
                </div>
                <AnimatedProgress
                  value={item.overallScore}
                  max={100}
                  className="h-3"
                  culturalStyle="modern"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {language === 'ar' ? 'التحسن:' : 'Improvement:'} +{item.trends.improvement}%
                  </span>
                  <span>
                    {language === 'ar' ? 'السابق:' : 'Previous:'} {item.trends.previousScore}%
                  </span>
                </div>
              </div>

              {/* Controls Breakdown */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-lg font-bold text-green-600">{item.compliantControls}</span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {language === 'ar' ? 'متوافق' : 'Compliant'}
                  </span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <XCircle className="h-4 w-4 text-red-600 mr-1" />
                    <span className="text-lg font-bold text-red-600">{item.nonCompliantControls}</span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {language === 'ar' ? 'غير متوافق' : 'Non-Compliant'}
                  </span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-4 w-4 text-yellow-600 mr-1" />
                    <span className="text-lg font-bold text-yellow-600">{item.inProgressControls}</span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}
                  </span>
                </div>
              </div>

              {/* Assessment Dates */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {language === 'ar' ? 'آخر تقييم:' : 'Last Assessment:'} {new Date(item.lastAssessment).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span>
                      {language === 'ar' ? 'التقييم القادم:' : 'Next Assessment:'} {new Date(item.nextAssessment).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Overall Compliance Trend */}
      <AnimatedCard hover3D={false} culturalPattern={true}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <ArabicTextEngine
              personalityType="professional"
              style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c' }}
            >
              {language === 'ar' ? 'اتجاه الامتثال العام' : 'Overall Compliance Trend'}
            </ArabicTextEngine>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-green-600">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">
                  {language === 'ar' ? 'تحسن بنسبة +2.3%' : '+2.3% Improvement'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">87.5%</div>
              <div className="text-sm text-gray-600">
                {language === 'ar' ? 'متوسط الامتثال' : 'Average Compliance'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">556</div>
              <div className="text-sm text-gray-600">
                {language === 'ar' ? 'إجمالي الضوابط' : 'Total Controls'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">4</div>
              <div className="text-sm text-gray-600">
                {language === 'ar' ? 'أطر نشطة' : 'Active Frameworks'}
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default ComplianceTrackingPage;
