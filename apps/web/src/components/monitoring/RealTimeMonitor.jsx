import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Clock, Zap, ZapOff, TrendingUp, TrendingDown } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../theme/ThemeProvider';
import { apiServices } from '../../services/api';

const RealTimeMonitor = ({ data, enabled = true, loading = false }) => {
  const { t, language } = useI18n();
  const { isDark } = useTheme();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [realtimeData, setRealtimeData] = useState(data);
  const [isLoading, setIsLoading] = useState(loading);

  // Fetch real-time data from API
  const fetchRealtimeData = async () => {
    if (!enabled) return;
    
    try {
      setIsLoading(true);
      // Try multiple real-time endpoints
      let response;
      
      // First try risks real-time endpoint
      try {
        response = await apiServices.risks.getRealTimeMetrics();
      } catch (error) {
        // Fallback to monitoring real-time endpoint
        response = await apiServices.monitoring.getRealTimeMetrics();
      }
      
      if (response?.data) {
        setRealtimeData(response.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
      // Keep existing data on error
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time updates with data fetching
  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchRealtimeData();

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      fetchRealtimeData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [enabled]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'danger': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'danger': return AlertTriangle;
      default: return Activity;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {enabled ? (
            <Zap className="w-5 h-5 text-green-500 animate-pulse" />
          ) : (
            <ZapOff className="w-5 h-5 text-gray-400" />
          )}
          <span className={`text-sm font-medium ${enabled ? 'text-green-600' : 'text-gray-500'}`}>
            {enabled ? t('monitor.realtime_active') : t('monitor.realtime_inactive')}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          {t('monitor.last_update')}: {lastUpdate.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US')}
        </div>
      </div>

      {/* Real-time KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {realtimeData?.kpis && Object.entries(realtimeData.kpis).map(([key, kpi]) => {
          const StatusIcon = getStatusIcon(kpi.status);
          const TrendIcon = getTrendIcon(kpi.trend);
          
          return (
            <motion.div
              key={key}
              initial={{ scale: 1 }}
              animate={{ scale: enabled ? [1, 1.02, 1] : 1 }}
              transition={{ 
                duration: 2, 
                repeat: enabled ? Infinity : 0,
                repeatType: 'reverse'
              }}
              className={`
                p-4 rounded-lg border transition-colors duration-200
                ${isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <StatusIcon className={`w-5 h-5 ${getStatusColor(kpi.status)}`} />
                <div className="flex items-center gap-1 text-xs">
                  <TrendIcon className={`w-3 h-3 ${kpi.trend === 'up' ? 'text-green-500' : kpi.trend === 'down' ? 'text-red-500' : 'text-gray-400'}`} />
                  <span className={kpi.trend === 'up' ? 'text-green-500' : kpi.trend === 'down' ? 'text-red-500' : 'text-gray-400'}>
                    {kpi.delta}
                  </span>
                </div>
              </div>
              
              <div className="text-2xl font-bold mb-1">
                {kpi.value}
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {t(`dashboard.${key}`)}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Real-time Activity Feed */}
      <div className={`
        p-4 rounded-lg border h-64 overflow-y-auto
        ${isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
        }
      `}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          {t('monitor.live_activity')}
        </h3>
        
        <div className="space-y-3">
          <AnimatePresence>
            {realtimeData?.activityFeed?.slice(0, 10).map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  flex items-center gap-3 p-3 rounded-md transition-colors
                  ${index === 0 && enabled ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                `}
              >
                <div className={`w-2 h-2 rounded-full ${index === 0 && enabled ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {activity.action} {activity.target}
                  </div>
                  <div className="text-xs text-gray-500">
                    {activity.user} • {activity.time}
                  </div>
                </div>
                
                <div className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${activity.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    activity.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    activity.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }
                `}>
                  {activity.status}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMonitor;
