import React, { useState, useEffect } from 'react';
import PerformanceMonitor from '../../components/monitoring/PerformanceMonitor';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';
import { useRBAC } from '../../hooks/useRBAC';
import { PermissionBasedCard, PermissionBasedButton } from '../../components/common/PermissionBasedCard';
import { motion } from 'framer-motion';
import { RefreshCw, Download, Settings, AlertTriangle, Activity, BarChart3 } from 'lucide-react';

const PerformanceMonitorPage = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('ar');
  const [alerts, setAlerts] = useState([]);
  const [historicalData, setHistoricalData] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  const { hasPermission, userRole, isSuperAdmin } = useRBAC();

  // Load performance data from API
  useEffect(() => {
    loadPerformanceData();
    loadAlerts();
    loadHistoricalData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadPerformanceData();
      loadAlerts();
    }, 30000);
    
    const savedLanguage = localStorage.getItem('language') || 'ar';
    setLanguage(savedLanguage);
    
    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await apiService.monitoring.getPerformanceMetrics();
      if (response?.data?.success && response.data.data) {
        setPerformanceData(response.data.data);
        setLastRefresh(new Date());
      } else {
        console.warn('Performance metrics API returned empty or invalid response');
        // Use empty state instead of mock fallback
        setPerformanceData({
          responseTime: 0,
          throughput: 0,
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0,
          networkLatency: 0,
          activeConnections: 0,
          errorRate: 0,
          uptime: 0,
          apiCalls: 0,
          lastUpdate: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
      toast.error(language === 'ar' ? 'فشل تحميل مقاييس الأداء' : 'Failed to load performance metrics');
      // Use empty state instead of mock fallback
      setPerformanceData({
        responseTime: 0,
        throughput: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkLatency: 0,
        activeConnections: 0,
        errorRate: 0,
        uptime: 0,
        apiCalls: 0,
        lastUpdate: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await apiService.monitoring.getAlertHistory(10);
      if (response?.data?.success && response.data.data) {
        setAlerts(response.data.data);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const loadHistoricalData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days
      
      const response = await apiService.monitoring.getHistoricalMetrics(
        startDate.toISOString(),
        endDate.toISOString()
      );
      if (response?.data?.success && response.data.data) {
        setHistoricalData(response.data.data);
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const dataToExport = {
        performance: performanceData,
        alerts: alerts,
        historical: historicalData,
        exportedAt: new Date().toISOString(),
        exportedBy: userRole
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(language === 'ar' ? 'تم تصدير البيانات بنجاح' : 'Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error(language === 'ar' ? 'فشل تصدير البيانات' : 'Failed to export data');
    }
  };

  const handleRefresh = () => {
    loadPerformanceData();
    loadAlerts();
    toast.success(language === 'ar' ? 'تم تحديث البيانات' : 'Data refreshed');
  };

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Page Header with Actions */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'مراقبة الأداء' : 'Performance Monitor'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {language === 'ar' ? 
              'مراقبة شاملة لأداء النظام والمقاييس في الوقت الفعلي' : 
              'Comprehensive system performance monitoring with real-time metrics'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {language === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {lastRefresh.toLocaleTimeString()}
          </span>
          
          <PermissionBasedButton
            requiredPermissions={['monitoring.refresh']}
            onClick={handleRefresh}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {language === 'ar' ? 'تحديث' : 'Refresh'}
          </PermissionBasedButton>
          
          <PermissionBasedButton
            requiredPermissions={['monitoring.export']}
            onClick={handleExportData}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {language === 'ar' ? 'تصدير' : 'Export'}
          </PermissionBasedButton>
        </div>
      </motion.div>

      {/* System Alerts Section */}
      <PermissionBasedCard
        requiredPermissions={['monitoring.view_alerts']}
        title={language === 'ar' ? 'تنبيهات النظام' : 'System Alerts'}
        icon={<AlertTriangle className="w-5 h-5" />}
        className="mb-6"
      >
        <div className="space-y-3">
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {alert.message || 'System alert'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(alert.created_at || Date.now()).toLocaleString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {alert.severity || 'low'}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>{language === 'ar' ? 'لا توجد تنبيهات حالياً' : 'No alerts currently'}</p>
            </div>
          )}
        </div>
      </PermissionBasedCard>

      {/* Main Performance Monitor Component */}
      <PerformanceMonitor 
        data={performanceData} 
        loading={loading} 
        onRefresh={handleRefresh}
        language={language}
      />

      {/* Advanced Analytics Section */}
      <PermissionBasedCard
        requiredPermissions={['monitoring.view_analytics']}
        title={language === 'ar' ? 'تحليلات متقدمة' : 'Advanced Analytics'}
        icon={<BarChart3 className="w-5 h-5" />}
        className="mt-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {language === 'ar' ? 'الاتجاهات التاريخية' : 'Historical Trends'}
            </h4>
            <div className="h-64 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center border">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'مخطط الاتجاهات التاريخية' : 'Historical trends chart'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {language === 'ar' ? 'آخر 7 أيام' : 'Last 7 days'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {language === 'ar' ? 'إحصائيات النظام' : 'System Statistics'}
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'إجمالي طلبات API' : 'Total API Requests'}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {performanceData?.apiCalls?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'متوسط وقت الاستجابة' : 'Average Response Time'}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {performanceData?.responseTime?.toFixed(2) || '0'} ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'معدل الخطأ' : 'Error Rate'}
                </span>
                <span className={`font-semibold ${
                  (performanceData?.errorRate || 0) < 1 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {performanceData?.errorRate?.toFixed(2) || '0'}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'وقت التشغيل' : 'Uptime'}
                </span>
                <span className="font-semibold text-green-600">
                  {performanceData?.uptime?.toFixed(2) || '0'}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </PermissionBasedCard>
    </div>
  );
};

export default PerformanceMonitorPage;
