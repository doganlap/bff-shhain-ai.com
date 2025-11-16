import React, { useState, useEffect, useCallback } from 'react';
import {
  Play, CheckCircle,
  AlertTriangle, RefreshCw, Server, Wifi, WifiOff, Activity, BarChart3,
  Clock
} from 'lucide-react';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner } from '../../components/Animation/InteractiveAnimationToolkit';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';

const APIManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('unknown');
  const [apiEndpoints, setApiEndpoints] = useState([]);
  const [apiMetrics, setApiMetrics] = useState({
    totalRequests: 0,
    successRate: 0,
    avgResponseTime: 0,
    activeConnections: 0
  });
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    checkAPIStatus();
    loadApiEndpoints();
    loadApiMetrics();
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
  }, [checkAPIStatus, loadApiEndpoints, loadApiMetrics]);

  const checkAPIStatus = useCallback(async () => {
    try {
      const response = await apiService.system.health();
      setApiStatus(response?.data?.success ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('API health check failed:', error);
      setApiStatus('disconnected');
    }
  }, []);

  const loadApiEndpoints = useCallback(async () => {
    try {
      const response = await apiService.system.getEndpoints();
      if (response?.data?.success && response.data.data) {
        setApiEndpoints(response.data.data);
      }
    } catch (error) {
      console.error('Error loading API endpoints:', error);
      toast.error('Failed to load API endpoints');
    }
  }, []);

  const loadApiMetrics = useCallback(async () => {
    try {
      const response = await apiService.system.getMetrics();
      if (response?.data?.success && response.data.data) {
        setApiMetrics(response.data.data);
      }
    } catch (error) {
      console.error('Error loading API metrics:', error);
      toast.error('Failed to load API metrics');
    }
  }, []);

  const testApiEndpoint = async (endpoint) => {
    setLoading(true);
    try {
      const response = await apiService.system.testEndpoint(endpoint);
      if (response?.data?.success) {
        toast.success(`${endpoint} test successful`);
      } else {
        toast.error(`${endpoint} test failed`);
      }
    } catch (error) {
      console.error(`Error testing ${endpoint}:`, error);
      toast.error(`${endpoint} test failed`);
    } finally {
      setLoading(false);
    }
  };

  const refreshAllMetrics = async () => {
    setLoading(true);
    await Promise.all([
      checkAPIStatus(),
      loadApiEndpoints(),
      loadApiMetrics()
    ]);
    setLoading(false);
    toast.success('Metrics refreshed');
  };

  if (loading && apiEndpoints.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'إدارة واجهة برمجة التطبيقات' : 'API Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'مراقبة وإدارة جميع نقاط النهاية لواجهة برمجة التطبيقات' : 'Monitor and manage all API endpoints and connections'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            apiStatus === 'connected' ? 'bg-green-100 text-green-800' : 
            apiStatus === 'disconnected' ? 'bg-red-100 text-red-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {apiStatus === 'connected' ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {language === 'ar' ? 
                (apiStatus === 'connected' ? 'متصل' : apiStatus === 'disconnected' ? 'غير متصل' : 'غير معروف') :
                (apiStatus === 'connected' ? 'Connected' : apiStatus === 'disconnected' ? 'Disconnected' : 'Unknown')
              }
            </span>
          </div>

          <AnimatedButton
            variant="outline"
            culturalStyle="modern"
            onClick={refreshAllMetrics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {language === 'ar' ? 'تحديث' : 'Refresh'}
          </AnimatedButton>
        </div>
      </div>

      {/* API Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedCard hover3D={true} culturalPattern={false}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                {language === 'ar' ? 'إجمالي الطلبات' : 'Total Requests'}
              </h3>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {apiMetrics.totalRequests.toLocaleString()}
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={true} culturalPattern={false}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                {language === 'ar' ? 'معدل النجاح' : 'Success Rate'}
              </h3>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {apiMetrics.successRate}%
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={true} culturalPattern={false}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                {language === 'ar' ? 'متوسط وقت الاستجابة' : 'Avg Response Time'}
              </h3>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {apiMetrics.avgResponseTime}ms
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={true} culturalPattern={false}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                {language === 'ar' ? 'الاتصالات النشطة' : 'Active Connections'}
              </h3>
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {apiMetrics.activeConnections}
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* API Endpoints */}
      <AnimatedCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'نقاط النهاية' : 'API Endpoints'}
            </h2>
          </div>

          {apiEndpoints.length === 0 ? (
            <div className="text-center py-12">
              <Server className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {language === 'ar' ? 'لا توجد نقاط نهاية' : 'No endpoints available'}
              </p>
              <p className="text-gray-400">
                {language === 'ar' ? 'قم بتحديث النظام للحصول على أحدث المعلومات' : 'Refresh to get the latest endpoint information'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {apiEndpoints.map((endpoint) => (
                <div key={endpoint.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      endpoint.status === 'healthy' ? 'bg-green-100 text-green-600' :
                      endpoint.status === 'degraded' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {endpoint.status === 'healthy' ? <CheckCircle className="h-4 w-4" /> :
                       endpoint.status === 'degraded' ? <AlertTriangle className="h-4 w-4" /> :
                       <AlertTriangle className="h-4 w-4" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {endpoint.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {endpoint.method} {endpoint.path}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {endpoint.responseTime}ms
                    </span>
                    <button
                      onClick={() => testApiEndpoint(endpoint.path)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title={language === 'ar' ? 'اختبار النقطة' : 'Test Endpoint'}
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default APIManagementPage;
