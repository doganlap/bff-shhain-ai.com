/**
 * Usage Dashboard Page (Tenant View)
 * Monitor license usage, limits, and warnings
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, HardDrive, Activity, TrendingUp, AlertCircle, 
  CheckCircle, BarChart3, Calendar, ArrowUp, Download, RefreshCw, Settings, Zap, ChevronUp, ChevronDown 
} from 'lucide-react';
import { toast } from 'sonner';
import usageApi from '../../services/usageApi';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../components/theme/ThemeProvider';
import { useApp } from '../../context/AppContext';
import AdvancedAnalyticsDashboard from '../../components/analytics/AdvancedAnalyticsDashboard';

export default function UsageDashboardPage() {
  const { t, isRTL } = useI18n();
  const { isDark } = useTheme();
  const { state } = useApp();
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usageCardsVisible, setUsageCardsVisible] = useState(true);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const tenantId = state.user?.tenant_id;

  useEffect(() => {
    if (tenantId) {
      loadUsage();
    }
  }, [tenantId]);

  const loadUsage = async () => {
    try {
      setLoading(true);
      console.log('Loading usage data for tenant:', tenantId);
      
      const data = await usageApi.getTenantUsage(tenantId);
      console.log('Usage data received:', data);
      setUsage(data.data || []);
      
    } catch (error) {
      console.error('Error loading usage:', error);
      toast.error('Failed to load usage data');
      const mock = [
        {
          feature_code: 'USERS',
          feature_name: 'Users',
          usage_type: 'USERS',
          used_value: 12,
          limit_value: 20,
          percentage_used: 60,
          is_over_limit: false,
          period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          period_end: new Date().toISOString()
        },
        {
          feature_code: 'STORAGE',
          feature_name: 'Storage',
          usage_type: 'STORAGE',
          used_value: 8,
          limit_value: 10,
          percentage_used: 80,
          is_over_limit: false,
          period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          period_end: new Date().toISOString()
        },
        {
          feature_code: 'API_CALLS',
          feature_name: 'API Calls',
          usage_type: 'API_CALLS',
          used_value: 12000,
          limit_value: 20000,
          percentage_used: 60,
          is_over_limit: false,
          period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          period_end: new Date().toISOString()
        }
      ];
      setUsage(mock);
    } finally {
      setLoading(false);
    }
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUsageIcon = (usageType) => {
    switch (usageType) {
      case 'USERS': return <Users className="w-6 h-6" />;
      case 'STORAGE': return <HardDrive className="w-6 h-6" />;
      case 'API_CALLS': return <Activity className="w-6 h-6" />;
      default: return <BarChart3 className="w-6 h-6" />;
    }
  };

  const formatUsageValue = (value, usageType) => {
    if (usageType === 'STORAGE') {
      return `${value} GB`;
    }
    if (usageType === 'API_CALLS') {
      return value.toLocaleString();
    }
    return value;
  };

  const exportUsageData = async () => {
    try {
      const exportData = {
        usage,
        tenantId,
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usage-dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export usage data');
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Usage Dashboard
          </h1>
          <p className={`mt-1 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor your license usage and limits
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : usage.length === 0 ? (
          <div className={`rounded-lg shadow-md p-12 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <Activity className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No Usage Data
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              No active license or usage data available
            </p>
          </div>
        ) : (
          <>
            {/* Dashboard Overview - Compact Style */}
            <div className={`rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    GRC Dashboard
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Comprehensive governance, risk, and compliance overview
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
              </div>
              
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-700/50' : 'bg-white/70'}`}>
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm font-medium ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                      Features
                    </h3>
                    <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {usage.length}
                    </span>
                  </div>
                </div>
                
                <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-700/50' : 'bg-white/70'}`}>
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm font-medium ${isDark ? 'text-green-300' : 'text-green-600'}`}>
                      Permissions
                    </h3>
                    <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {state.user?.permissions?.length || 0}
                    </span>
                  </div>
                </div>
                
                <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-700/50' : 'bg-white/70'}`}>
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                      Current Role
                    </h3>
                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {state.user?.role || 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={exportUsageData}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Usage Data
                </button>
                <button
                  type="button"
                  onClick={loadUsage}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Usage
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  {showAdvancedAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                </button>
              </div>
            </div>

            {/* Advanced Analytics Dashboard */}
            {showAdvancedAnalytics && (
              <div className="mb-8">
                <AdvancedAnalyticsDashboard
                  data={usage}
                  tenantId={tenantId}
                  loading={loading}
                  mode="realtime"
                  onRefresh={loadUsage}
                  onExport={exportUsageData}
                />
              </div>
            )}

            {/* Usage Cards - Collapsible Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  License Usage Overview
                </h2>
                <button
                  type="button"
                  onClick={() => setUsageCardsVisible(!usageCardsVisible)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  aria-label={usageCardsVisible ? "Hide usage cards" : "Show usage cards"}
                >
                  {usageCardsVisible ? (
                    <><ChevronUp className="w-4 h-4" /> Hide</>
                  ) : (
                    <><ChevronDown className="w-4 h-4" /> Show</>
                  )}
                </button>
              </div>
              
              {usageCardsVisible && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {usage.map((item) => (
                    <div
                      key={item.feature_code}
                      className={`rounded-lg shadow-md p-4 sm:p-6 transition-all hover:shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600">
                            {getUsageIcon(item.usage_type)}
                          </div>
                          <div>
                            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {item.feature_name}
                            </h3>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              {item.usage_type}
                            </p>
                          </div>
                        </div>
                        {item.is_over_limit && (
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        )}
                      </div>

                      {/* Usage Values */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                          <span className={`text-3xl sm:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.percentage_used.toFixed(0)}%
                          </span>
                          <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            used
                          </span>
                        </div>
                        <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {formatUsageValue(item.used_value, item.usage_type)} / {formatUsageValue(item.limit_value, item.usage_type)}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                        <div
                          className={`h-full ${getUsageColor(item.percentage_used)} transition-all duration-300`}
                          style={{ width: `${Math.min(item.percentage_used, 100)}%` }}
                        ></div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          Period: {new Date(item.period_start).toLocaleDateString()} - {new Date(item.period_end).toLocaleDateString()}
                        </span>
                        {item.percentage_used >= 80 && !item.is_over_limit && (
                          <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                            Approaching Limit
                          </span>
                        )}
                        {item.is_over_limit && (
                          <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                            Over Limit
                          </span>
                        )}
                      </div>

                      {/* Upgrade Prompt */}
                      {item.percentage_used >= 80 && (
                        <button
                          type="button"
                          onClick={() => window.location.href = '/platform/licenses/upgrade'}
                          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Upgrade Plan
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Warnings & Recommendations */}
            {usage.some(item => item.percentage_used >= 80) && (
              <div className={`rounded-lg shadow-md p-4 sm:p-6 ${isDark ? 'bg-orange-900 bg-opacity-20' : 'bg-orange-50'}`}>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className={`text-base sm:text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Usage Warning
                    </h3>
                    <p className={`mb-4 text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      You're approaching your usage limits. Consider upgrading to avoid service interruption.
                    </p>
                    <button
                      type="button"
                      onClick={() => window.location.href = '/platform/licenses/upgrade'}
                      className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm sm:text-base"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Usage Tips */}
            <div className={`mt-6 rounded-lg shadow-md p-4 sm:p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-base sm:text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Usage Tips
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Archive old data to free up storage space
                  </span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Remove inactive users to optimize licenses
                  </span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Review API usage patterns to reduce unnecessary calls
                  </span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}