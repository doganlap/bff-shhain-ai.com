import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, Target, Filter } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../theme/ThemeProvider';

const AdvancedAnalyticsPanel = ({ data, filters, loading = false }) => {
  const { t, isRTL } = useI18n();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('trends');

  // Process data for analytics
  const processAnalyticsData = () => {
    if (!data || loading) return { trends: [], distribution: [], radar: [] };

    // Generate trend data
    const trends = data.trendData || [];
    
    // Generate distribution data
    const distribution = [
      { name: 'High Risk', value: 30, color: '#ef4444' },
      { name: 'Medium Risk', value: 45, color: '#f59e0b' },
      { name: 'Low Risk', value: 25, color: '#10b981' }
    ];

    // Generate radar data
    const radar = [
      { subject: 'Compliance', A: 85, fullMark: 100 },
      { subject: 'Risk Management', A: 75, fullMark: 100 },
      { subject: 'Controls', A: 90, fullMark: 100 },
      { subject: 'Frameworks', A: 80, fullMark: 100 },
      { subject: 'Assessments', A: 88, fullMark: 100 },
      { subject: 'Monitoring', A: 82, fullMark: 100 }
    ];

    return { trends, distribution, radar };
  };

  const analyticsData = processAnalyticsData();

  const tabs = [
    { id: 'trends', label: t('analytics.trends'), icon: TrendingUp },
    { id: 'distribution', label: t('analytics.distribution'), icon: PieChartIcon },
    { id: 'performance', label: t('analytics.performance'), icon: Target }
  ];

  const renderTrendsChart = () => (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={analyticsData.trends}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
          <XAxis 
            dataKey="date" 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          />
          <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
          <Tooltip 
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="compliance" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="risks" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderDistributionChart = () => (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={analyticsData.distribution}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {analyticsData.distribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const renderPerformanceRadar = () => (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={analyticsData.radar}>
          <PolarGrid stroke={isDark ? '#374151' : '#e5e7eb'} />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name="Performance"
            dataKey="A"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Chart Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'trends' && renderTrendsChart()}
        {activeTab === 'distribution' && renderDistributionChart()}
        {activeTab === 'performance' && renderPerformanceRadar()}
      </motion.div>

      {/* Filters Summary */}
      <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Filter className="w-3 h-3" />
          {t('analytics.active_filters')}:
        </span>
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
          {filters?.timeRange || '30d'}
        </span>
        {filters?.selectedFramework && filters.selectedFramework !== 'all' && (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
            {filters.selectedFramework}
          </span>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalyticsPanel;
