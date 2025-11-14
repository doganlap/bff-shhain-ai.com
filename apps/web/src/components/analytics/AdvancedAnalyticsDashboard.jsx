/**
 * Advanced Analytics Dashboard Component
 * Comprehensive analytics with charts and database API integration
 */

import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, HardDrive, Activity, Calendar, Filter, Download, RefreshCw, BarChart3, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../../context/AppContext';
import analyticsApi from '../../services/analyticsApi';
import { toast } from 'sonner';

const AdvancedAnalyticsDashboard = ({ 
  data = [], 
  tenantId, 
  loading = false, 
  mode = 'standard',
  onRefresh,
  onExport 
}) => {
  const { isDark } = useTheme();
  const { state } = useApp();
  const [analyticsData, setAnalyticsData] = useState({
    usageTrends: [],
    featureBreakdown: [],
    timeSeries: [],
    topFeatures: [],
    alerts: [],
    summary: {}
  });
  const [filters, setFilters] = useState({
    timeframe: '30d',
    featureType: 'all',
    dateRange: { start: null, end: null }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRealTimeUpdating, setIsRealTimeUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // Chart colors for different themes
  const chartColors = {
    primary: isDark ? '#3B82F6' : '#2563EB',
    secondary: isDark ? '#8B5CF6' : '#7C3AED',
    success: isDark ? '#10B981' : '#059669',
    warning: isDark ? '#F59E0B' : '#D97706',
    danger: isDark ? '#EF4444' : '#DC2626',
    grid: isDark ? '#374151' : '#E5E7EB',
    text: isDark ? '#D1D5DB' : '#6B7280'
  };

  // Load analytics data from API
  useEffect(() => {
    if (data.length > 0 && tenantId) {
      loadAnalyticsData();
    }
  }, [data, tenantId, filters]);

  // Real-time data updates
  useEffect(() => {
    if (!tenantId || mode !== 'realtime') return;

    const interval = setInterval(() => {
      loadRealTimeData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [tenantId, mode]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading analytics data for tenant:', tenantId);
      
      // Try to fetch real analytics data from API
      try {
        const [analyticsResponse, trendsResponse, breakdownResponse, efficiencyResponse, alertsResponse] = await Promise.all([
          analyticsApi.getTenantAnalytics(tenantId, filters),
          analyticsApi.getUsageTrends(tenantId, filters.timeframe),
          analyticsApi.getFeatureBreakdown(tenantId),
          analyticsApi.getEfficiencyMetrics(tenantId, filters.dateRange),
          analyticsApi.getUsageAlerts(tenantId, 80)
        ]);
        
        console.log('API responses:', {
          analytics: analyticsResponse,
          trends: trendsResponse,
          breakdown: breakdownResponse,
          efficiency: efficiencyResponse,
          alerts: alertsResponse
        });
        
        // Combine all analytics data
        const combinedData = {
          usageTrends: analyticsResponse.usageTrends || [],
          featureBreakdown: breakdownResponse.features || [],
          timeSeries: trendsResponse.timeSeries || [],
          topFeatures: analyticsResponse.topFeatures || [],
          alerts: alertsResponse.alerts || [],
          summary: {
            ...analyticsResponse.summary,
            ...efficiencyResponse.summary
          }
        };
        
        setAnalyticsData(combinedData);
        setLastUpdateTime(new Date());
        console.log('Analytics data loaded successfully');
        
      } catch (apiError) {
        console.warn('API call failed, falling back to mock data:', apiError);
        toast.info('Using demo data - API connection unavailable');
        
        // Fallback to mock data if API fails
        const mockData = generateAnalyticsData();
        setAnalyticsData(mockData);
      }
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
      
      // Final fallback to empty data
      setAnalyticsData({
        usageTrends: [],
        featureBreakdown: [],
        timeSeries: [],
        topFeatures: [],
        alerts: [],
        summary: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate analytics data from real API data
  const generateAnalyticsData = () => {
    console.log('Generating analytics data from:', data);
    
    if (!data || data.length === 0) {
      // Return empty state if no input data
      return {
        usageTrends: [],
        featureBreakdown: [],
        timeSeries: [],
        topFeatures: [],
        alerts: [],
        summary: {
          totalFeatures: 0,
          overLimit: 0,
          warningCount: 0,
          averageUsage: 0,
          totalUsed: 0,
          totalLimit: 0
        }
      };
    }

    const usageTrends = data.map(item => ({
      name: item.feature_name,
      used: item.used_value,
      limit: item.limit_value,
      percentage: item.percentage_used,
      overLimit: item.is_over_limit,
      date: new Date(item.period_start).toLocaleDateString()
    }));

    const featureBreakdown = data.reduce((acc, item) => {
      const existing = acc.find(f => f.name === item.usage_type);
      if (existing) {
        existing.value += item.used_value;
        existing.count += 1;
      } else {
        acc.push({
          name: item.usage_type,
          value: item.used_value,
          count: 1,
          color: getColorForType(item.usage_type)
        });
      }
      return acc;
    }, []);

    const timeSeries = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        usage: 0, // Use real data instead of Math.random()
        limit: 200,
        efficiency: 0 // Use real data instead of Math.random()
      };
    });

    const topFeatures = data
      .sort((a, b) => b.percentage_used - a.percentage_used)
      .slice(0, 5)
      .map(item => ({
        name: item.feature_name,
        usage: item.percentage_used,
        status: item.is_over_limit ? 'over-limit' : item.percentage_used >= 80 ? 'warning' : 'normal'
      }));

    const alerts = data
      .filter(item => item.percentage_used >= 80)
      .map(item => ({
        feature: item.feature_name,
        percentage: item.percentage_used,
        severity: item.is_over_limit ? 'critical' : 'warning',
        message: item.is_over_limit ? 'Over usage limit' : 'Approaching limit'
      }));

    const summary = {
      totalFeatures: data.length,
      overLimit: data.filter(item => item.is_over_limit).length,
      warningCount: data.filter(item => item.percentage_used >= 80 && !item.is_over_limit).length,
      averageUsage: data.reduce((sum, item) => sum + item.percentage_used, 0) / data.length,
      totalUsed: data.reduce((sum, item) => sum + item.used_value, 0),
      totalLimit: data.reduce((sum, item) => sum + item.limit_value, 0)
    };

    return {
      usageTrends,
      featureBreakdown,
      timeSeries,
      topFeatures,
      alerts,
      summary
    };
  };

  const getColorForType = (type) => {
    const colors = {
      'USERS': '#3B82F6',
      'STORAGE': '#8B5CF6',
      'API_CALLS': '#10B981',
      'default': '#6B7280'
    };
    return colors[type] || colors.default;
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const loadRealTimeData = async () => {
    try {
      setIsRealTimeUpdating(true);
      const realTimeData = await analyticsApi.getRealTimeAnalytics(tenantId);
      
      // Update time series with new real-time data point
      setAnalyticsData(prev => ({
        ...prev,
        timeSeries: [...prev.timeSeries.slice(-6), realTimeData.latestMetric]
      }));
      
      setLastUpdateTime(new Date());
      
    } catch (error) {
      console.error('Error loading real-time data:', error);
    } finally {
      setIsRealTimeUpdating(false);
    }
  };

  const handleRefresh = () => {
    loadAnalyticsData();
    if (onRefresh) onRefresh();
  };

  const handleExport = async (format = 'json') => {
    try {
      let exportData;
      let filename;
      let contentType;
      
      if (format === 'csv') {
        // Generate CSV data
        const csvData = generateCSVData(analyticsData);
        exportData = csvData;
        filename = `analytics-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
        contentType = 'text/csv';
      } else {
        // Use API export for JSON format
        exportData = await analyticsApi.exportAnalytics(tenantId, format);
        filename = `analytics-dashboard-${new Date().toISOString().split('T')[0]}.${format}`;
        contentType = 'application/json';
      }
      
      const blob = new Blob([exportData], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      if (onExport) onExport(exportData);
      toast.success(`Analytics data exported as ${format.toUpperCase()}`);
      
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export analytics data');
    }
  };

  const generateCSVData = (data) => {
    const headers = ['Feature', 'Usage', 'Limit', 'Percentage', 'Status', 'Date'];
    const rows = data.usageTrends.map(item => [
      item.name,
      item.used,
      item.limit,
      item.percentage,
      item.overLimit ? 'Over Limit' : 'Normal',
      item.date
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  if (isLoading && analyticsData.usageTrends.length === 0) {
    return (
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading analytics...</span>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (analyticsData.usageTrends.length === 0 && analyticsData.timeSeries.length === 0) {
    return (
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="text-center py-12">
          <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No Analytics Data
          </h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {data.length === 0 ? 'No usage data available to analyze' : 'Unable to load analytics data'}
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${isDark ? 'text-white' : 'text-gray-900'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <div className="flex items-center gap-4 mt-1">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Comprehensive usage insights and trends
            </p>
            {lastUpdateTime && (
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Last updated: {lastUpdateTime.toLocaleTimeString()}
              </div>
            )}
            {mode === 'realtime' && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isRealTimeUpdating ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isRealTimeUpdating ? 'Updating...' : 'Real-time'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            aria-label="Refresh analytics data"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExport('json')}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Export analytics data as JSON"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
            <button
              type="button"
              onClick={() => handleExport('csv')}
              className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              aria-label="Export analytics data as CSV"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'}`}>
        <h3 className="text-sm font-semibold mb-2">Debug Info:</h3>
        <div className="text-xs space-y-1">
          <div>Data length: {data.length}</div>
          <div>Usage trends: {analyticsData.usageTrends.length}</div>
          <div>Feature breakdown: {analyticsData.featureBreakdown.length}</div>
          <div>Time series: {analyticsData.timeSeries.length}</div>
          <div>Top features: {analyticsData.topFeatures.length}</div>
          <div>Alerts: {analyticsData.alerts.length}</div>
          <div>Summary keys: {Object.keys(analyticsData.summary).length}</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Features</p>
              <p className="text-2xl font-bold">{analyticsData.summary.totalFeatures || 0}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Over Limit</p>
              <p className="text-2xl font-bold text-red-500">{analyticsData.summary.overLimit || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Warnings</p>
              <p className="text-2xl font-bold text-orange-500">{analyticsData.summary.warningCount || 0}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Usage</p>
              <p className="text-2xl font-bold">
                {analyticsData.summary.averageUsage ? `${analyticsData.summary.averageUsage.toFixed(1)}%` : '0%'}
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trends Chart */}
        {analyticsData.timeSeries.length > 0 && (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className="text-lg font-semibold mb-4">Usage Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="date" stroke={chartColors.text} />
                <YAxis stroke={chartColors.text} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${chartColors.grid}`,
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="usage" 
                  stroke={chartColors.primary} 
                  fill={chartColors.primary}
                  fillOpacity={0.3}
                  name="Usage"
                />
                <Line 
                  type="monotone" 
                  dataKey="limit" 
                  stroke={chartColors.danger} 
                  strokeDasharray="5 5"
                  name="Limit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Feature Breakdown Pie Chart */}
        {analyticsData.featureBreakdown.length > 0 && (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className="text-lg font-semibold mb-4">Feature Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.featureBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.featureBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Features Bar Chart */}
        {analyticsData.topFeatures.length > 0 && (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className="text-lg font-semibold mb-4">Top Features by Usage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.topFeatures} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis type="number" stroke={chartColors.text} />
                <YAxis dataKey="name" type="category" stroke={chartColors.text} width={100} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${chartColors.grid}`,
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="usage" 
                  fill={chartColors.primary}
                  radius={[0, 4, 4, 0]}
                  name="Usage %"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Efficiency Metrics */}
        {analyticsData.timeSeries.length > 0 && (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className="text-lg font-semibold mb-4">Efficiency Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="date" stroke={chartColors.text} />
                <YAxis stroke={chartColors.text} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${chartColors.grid}`,
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke={chartColors.success} 
                  strokeWidth={3}
                  dot={{ fill: chartColors.success, strokeWidth: 2, r: 4 }}
                  name="Efficiency %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Alerts Section */}
      {analyticsData.alerts.length > 0 && (
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className="text-lg font-semibold mb-4">Usage Alerts</h3>
          <div className="space-y-3">
            {analyticsData.alerts.map((alert, index) => (
              <div 
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  alert.severity === 'critical' 
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                }`}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">{alert.feature}</p>
                  <p className="text-sm">{alert.message} ({alert.percentage.toFixed(1)}%)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdvancedAnalyticsDashboard;