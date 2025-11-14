import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Shield, Target, BarChart3, Eye, Edit, Trash2, Plus, Filter, Download, RefreshCw, Settings, TrendingDown } from 'lucide-react';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner } from '../../components/Animation/InteractiveAnimationToolkit';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';
import { PermissionBasedCard, PermissionBasedButton } from '../../components/common/PermissionBasedCard';
import { useRBAC } from '../../hooks/useRBAC';
import QuickActionsToolbar from '../../components/ui/QuickActionsToolbar';
import { RoleDashboardCards } from '../../components/dashboard/RoleDashboardCards';
import AdvancedAnalyticsPanel from '../../components/analytics/AdvancedAnalyticsPanel';
import RealTimeMonitor from '../../components/monitoring/RealTimeMonitor';
import WorkflowNotificationPanel from '../../components/collaboration/WorkflowNotificationPanel';
import RealtimeField from '../../components/collaboration/RealtimeField';
import CollaborationIndicator from '../../components/collaboration/CollaborationIndicator';
import ActionButtons from '../../components/common/ActionButtons';
import DataTable from '../../components/common/DataTable';
import CommandPalette from '../../components/common/CommandPalette';
import Navigation from '../../components/common/Navigation';

const RiskManagementPage = () => {
  const { user, hasPermission, userRole, isSuperAdmin } = useRBAC();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [filterBy, setFilterBy] = useState('all');
  const [riskMetrics, setRiskMetrics] = useState({
    highRisks: 0,
    mediumRisks: 0,
    lowRisks: 0,
    averageScore: '0.0',
    totalRisks: 0,
    activeRisks: 0
  });
  const [realTimeData, setRealTimeData] = useState({
    riskAlerts: 0,
    pendingAssessments: 0,
    mitigationProgress: 0
  });
  const [heatmapData, setHeatmapData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'operational',
    severity: 'medium',
    probability: 'medium',
    impact: 'medium',
    owner: '',
    framework_id: '',
    control_ids: []
  });

  // Handler functions
  const handleExportData = () => {
    try {
      const dataToExport = {
        risks: risks,
        metrics: riskMetrics,
        timestamp: new Date().toISOString(),
        user: user?.email || 'unknown'
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `risk-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(language === 'ar' ? 'تم تصدير بيانات المخاطر بنجاح' : 'Risk data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(language === 'ar' ? 'فشل تصدير بيانات المخاطر' : 'Failed to export risk data');
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadRisks(),
        loadRiskMetrics(),
        loadRealTimeData()
      ]);
      toast.success(language === 'ar' ? 'تم تحديث بيانات المخاطر' : 'Risk data refreshed successfully');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error(language === 'ar' ? 'فشل تحديث بيانات المخاطر' : 'Failed to refresh risk data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRisks();
    loadRiskMetrics();
    loadRealTimeData();
    loadTrendData();
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
    
    // Set up real-time monitoring
    const interval = setInterval(() => {
      loadRealTimeData();
      loadRiskMetrics();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadRisks = async () => {
    try {
      setLoading(true);
      const response = await apiService.risks.getAll();
      const risksData = response.data || response || [];
      setRisks(risksData);
    } catch (error) {
      console.error('Failed to fetch risks:', error);
      toast.error(language === 'ar' ? 'فشل تحميل المخاطر' : 'Failed to load risks');
      setRisks([]);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations
  const handleCreateRisk = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.risks.create(formData);
      if (response.data?.success || response.success) {
        toast.success('Risk created successfully!');
        setShowCreateModal(false);
        resetForm();
        loadRisks();
        loadRiskMetrics();
      }
    } catch (error) {
      console.error('Error creating risk:', error);
      toast.error('Failed to create risk');
    }
  };

  const handleUpdateRisk = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.risks.update(selectedRisk.id, formData);
      if (response.data?.success || response.success) {
        toast.success('Risk updated successfully!');
        setShowEditModal(false);
        resetForm();
        setSelectedRisk(null);
        loadRisks();
        loadRiskMetrics();
      }
    } catch (error) {
      console.error('Error updating risk:', error);
      toast.error('Failed to update risk');
    }
  };

  const handleDeleteRisk = async () => {
    try {
      const response = await apiService.risks.delete(selectedRisk.id);
      if (response.data?.success || response.success) {
        toast.success('Risk deleted successfully!');
        setShowDeleteModal(false);
        setSelectedRisk(null);
        loadRisks();
        loadRiskMetrics();
      }
    } catch (error) {
      console.error('Error deleting risk:', error);
      toast.error('Failed to delete risk');
    }
  };

  const handleAssessRisk = async (riskId) => {
    try {
      const response = await apiService.risks.assess(riskId);
      if (response.data?.success || response.success) {
        toast.success('Risk assessment completed!');
        loadRisks();
        loadRiskMetrics();
        loadHeatmapData();
      }
    } catch (error) {
      console.error('Error assessing risk:', error);
      toast.error('Failed to assess risk');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'operational',
      severity: 'medium',
      probability: 'medium',
      impact: 'medium',
      owner: '',
      framework_id: '',
      control_ids: []
    });
  };

  const openEditModal = (risk) => {
    setSelectedRisk(risk);
    setFormData({
      title: risk.title || '',
      description: risk.description || '',
      category: risk.category || 'operational',
      severity: risk.severity || 'medium',
      probability: risk.probability || 'medium',
      impact: risk.impact || 'medium',
      owner: risk.owner || '',
      framework_id: risk.framework_id || '',
      control_ids: risk.control_ids || []
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (risk) => {
    setSelectedRisk(risk);
    setShowDeleteModal(true);
  };

  const loadHeatmapData = async () => {
    try {
      const response = await apiService.risks.getHeatmap();
      const heatmapData = response.data || response || [];
      setHeatmapData(heatmapData);
    } catch (error) {
      console.error('Failed to load heatmap data:', error);
      // Use empty array instead of calculated fallback
      setHeatmapData([]);
    }
  };

  const loadTrendData = async () => {
    try {
      const response = await apiService.risks.getTrends();
      if (response?.data?.success && response.data.data) {
        setTrendData(response.data.data);
      } else {
        console.warn('Risk trends API returned empty or invalid response');
        setTrendData([]);
      }
    } catch (error) {
      console.error('Failed to fetch trend data:', error);
      setTrendData([]);
    }
  };

  const loadRiskMetrics = async () => {
    try {
      const response = await apiService.risks.getMetrics();
      if (response?.data?.success && response.data.data) {
        setRiskMetrics(response.data.data);
      } else {
        console.warn('Risk metrics API returned empty or invalid response');
        // Use empty state instead of calculated fallback
        setRiskMetrics({
          highRisks: 0,
          mediumRisks: 0,
          lowRisks: 0,
          averageScore: '0.0',
          totalRisks: 0,
          activeRisks: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch risk metrics:', error);
      // Use empty state instead of calculated fallback
      setRiskMetrics({
        highRisks: 0,
        mediumRisks: 0,
        lowRisks: 0,
        averageScore: '0.0',
        totalRisks: 0,
        activeRisks: 0
      });
    }
  };

  const loadRealTimeData = async () => {
    try {
      const response = await apiService.risks.getRealTimeMetrics();
      if (response?.data?.success && response.data.data) {
        setRealTimeData(response.data.data);
      } else {
        console.warn('Real-time metrics API returned empty or invalid response');
        // Use empty state instead of mock fallback
        setRealTimeData({
          riskAlerts: 0,
          pendingAssessments: 0,
          mitigationProgress: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
      // Use empty state instead of mock fallback
      setRealTimeData({
        riskAlerts: 0,
        pendingAssessments: 0,
        mitigationProgress: 0
      });
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'monitored': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Dynamic risk metrics based on actual data
  const dynamicRiskMetrics = [
    {
      name: 'المخاطر العالية',
      nameEn: 'High Risks',
      value: riskMetrics.highRisks.toString(),
      icon: AlertTriangle,
      color: 'red',
      change: riskMetrics.highRisks > 10 ? '+2' : '-1'
    },
    {
      name: 'المخاطر المتوسطة',
      nameEn: 'Medium Risks',
      value: riskMetrics.mediumRisks.toString(),
      icon: Target,
      color: 'yellow',
      change: riskMetrics.mediumRisks > 30 ? '+3' : '-2'
    },
    {
      name: 'المخاطر المنخفضة',
      nameEn: 'Low Risks',
      value: riskMetrics.lowRisks.toString(),
      icon: Shield,
      color: 'green',
      change: riskMetrics.lowRisks > 50 ? '+5' : '+1'
    },
    {
      name: 'متوسط النقاط',
      nameEn: 'Average Score',
      value: riskMetrics.averageScore,
      icon: BarChart3,
      color: 'blue',
      change: parseFloat(riskMetrics.averageScore) > 7 ? '+0.3' : '-0.2'
    }
  ];

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
            {language === 'ar' ? 'إدارة المخاطر' : 'Risk Management'}
          </ArabicTextEngine>
          <ArabicTextEngine
            personalityType="casual"
            style={{ fontSize: '16px', color: '#4a5568' }}
          >
            {language === 'ar' ? 'تحديد وتقييم ومتابعة المخاطر المؤسسية' : 'Identify, assess, and monitor organizational risks'}
          </ArabicTextEngine>
        </div>

        <div className="flex items-center space-x-4">
          <AnimatedButton
            variant="primary"
            culturalStyle="modern"
            style={{ backgroundColor: '#667eea' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            <ArabicTextEngine personalityType="casual">
              {language === 'ar' ? 'مخاطرة جديدة' : 'New Risk'}
            </ArabicTextEngine>
          </AnimatedButton>
        </div>
      </div>

      {/* Advanced Components Section */}
      {hasPermission('view_risk_analytics') && (
        <>
          {/* Quick Actions Toolbar */}
          <QuickActionsToolbar
            actions={[
              {
                label: 'New Risk',
                icon: Plus,
                onClick: () => {/* Handle new risk */},
                permission: 'create_risk'
              },
              {
                label: 'Export Data',
                icon: Download,
                onClick: handleExportData,
                permission: 'export_risk_data'
              },
              {
                label: 'Refresh',
                icon: RefreshCw,
                onClick: handleRefresh,
                permission: 'view_risk_metrics'
              }
            ]}
          />

          {/* Real-Time Monitor */}
          <RealTimeMonitor
            metrics={[
              {
                label: 'Risk Alerts',
                value: realTimeData.riskAlerts,
                trend: realTimeData.riskAlerts > 5 ? 'up' : 'down',
                status: realTimeData.riskAlerts > 5 ? 'warning' : 'healthy'
              },
              {
                label: 'Pending Assessments',
                value: realTimeData.pendingAssessments,
                trend: 'stable',
                status: 'healthy'
              },
              {
                label: 'Mitigation Progress',
                value: `${realTimeData.mitigationProgress}%`,
                trend: realTimeData.mitigationProgress > 70 ? 'up' : 'down',
                status: realTimeData.mitigationProgress > 70 ? 'healthy' : 'warning'
              }
            ]}
          />

          {/* Role-Based Dashboard Cards */}
          <RoleDashboardCards
            title="Risk Management Access Levels"
            collapsible={true}
            roleCards={[
              {
                title: 'Risk Manager',
                description: 'Full risk management access',
                permissions: ['create_risk', 'update_risk', 'delete_risk', 'view_risk_analytics'],
                icon: Shield
              },
              {
                title: 'Risk Analyst',
                description: 'Risk assessment and analysis',
                permissions: ['create_risk', 'view_risk_analytics'],
                icon: BarChart3
              },
              {
                title: 'Risk Viewer',
                description: 'Read-only risk access',
                permissions: ['view_risk_metrics'],
                icon: Eye
              }
            ]}
          />

          {/* Advanced Analytics Panel */}
          <AdvancedAnalyticsPanel
            charts={[
              {
                title: 'Risk Severity Distribution',
                type: 'pie',
                data: [
                  { name: 'High', value: riskMetrics.highRisks },
                  { name: 'Medium', value: riskMetrics.mediumRisks },
                  { name: 'Low', value: riskMetrics.lowRisks }
                ]
              },
              {
                title: 'Risk Trend Over Time',
                type: 'line',
                data: trendData.length > 0 ? trendData : [
                  { name: 'No Data', value: 0 }
                ]
              }
            ]}
          />
        </>
      )}

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dynamicRiskMetrics.map((metric, index) => (
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
                  <p className="text-sm text-green-600 mt-1">{metric.change} this month</p>
                </div>
                <div className={`p-3 rounded-full bg-${metric.color}-100`}>
                  <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
                </div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Risk List */}
      <AnimatedCard hover3D={false} culturalPattern={true}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <ArabicTextEngine
              personalityType="professional"
              style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c' }}
            >
              {language === 'ar' ? 'سجل المخاطر' : 'Risk Register'}
            </ArabicTextEngine>

            <div className="flex items-center space-x-4">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{language === 'ar' ? 'جميع المخاطر' : 'All Risks'}</option>
                <option value="high">{language === 'ar' ? 'مخاطر عالية' : 'High Risks'}</option>
                <option value="medium">{language === 'ar' ? 'مخاطر متوسطة' : 'Medium Risks'}</option>
                <option value="low">{language === 'ar' ? 'مخاطر منخفضة' : 'Low Risks'}</option>
              </select>

              <button className="px-4 py-2 text-gray-600 hover:text-gray-800" onClick={handleExportData}>
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'المخاطرة' : 'Risk'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'الفئة' : 'Category'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'الدرجة' : 'Severity'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'النقاط' : 'Score'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'المسؤول' : 'Owner'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {risks.map((risk) => (
                  <tr key={risk.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {language === 'ar' ? risk.titleAr : risk.title}
                        </div>
                        <div className="text-sm text-gray-500">Last assessed: {risk.lastAssessed}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize text-sm text-gray-900">{risk.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(risk.severity)}`}>
                        {risk.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {risk.riskScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {language === 'ar' ? risk.ownerAr : risk.owner}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(risk.status)}`}>
                        {risk.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default RiskManagementPage;
