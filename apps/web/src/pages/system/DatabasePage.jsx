import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Database, Activity, BarChart3, Settings, Table, Plus, Search, Download,
  Upload, Eye, Edit, Trash2, Filter, RefreshCw, Users, FileText, Target,
  Shield, Building, Server, Zap, Clock, AlertCircle, CheckCircle,
  TrendingUp, Layers, Code, PlayCircle, PauseCircle, MonitorSpeaker
} from 'lucide-react';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';
import { PermissionBasedCard, PermissionBasedButton } from '../../components/common/PermissionBasedCard';
import { useRBAC } from '../../hooks/useRBAC';
import QuickActionsToolbar from '../../components/ui/QuickActionsToolbar';
import { RoleDashboardCards } from '../../components/dashboard/RoleDashboardCards';
import AdvancedAnalyticsPanel from '../../components/analytics/AdvancedAnalyticsPanel';
import RealTimeMonitor from '../../components/monitoring/RealTimeMonitor';
import { AnimatedCard, CulturalLoadingSpinner } from '../../components/Animation/InteractiveAnimationToolkit';

const DatabasePage = () => {
  const { user, hasPermission, userRole, isSuperAdmin } = useRBAC();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTable, setSelectedTable] = useState(null);
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('ar');
  const [dbMetrics, setDbMetrics] = useState({
    totalTables: 0,
    totalRecords: 0,
    storageUsed: '0 GB',
    connections: 0,
    uptime: '0 hours',
    performance: 0
  });
  const [tables, setTables] = useState([]);
  const [realTimeData, setRealTimeData] = useState({
    queriesPerSecond: 0,
    activeConnections: 0,
    replicationLag: 0,
    cacheHitRatio: 0
  });
  const [analyticsMode, setAnalyticsMode] = useState('standard');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Handler functions
  const handleExportData = () => {
    try {
      const dataToExport = {
        tables: tables,
        metrics: dbMetrics,
        timestamp: new Date().toISOString(),
        user: user?.email || 'unknown'
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(language === 'ar' ? 'تم تصدير البيانات بنجاح' : 'Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(language === 'ar' ? 'فشل تصدير البيانات' : 'Failed to export data');
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDatabaseStats(),
        loadTables(),
        loadRealTimeData()
      ]);
      setLastRefresh(new Date());
      toast.success(language === 'ar' ? 'تم تحديث البيانات' : 'Data refreshed successfully');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error(language === 'ar' ? 'فشل تحديث البيانات' : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch database metrics and tables from API
  useEffect(() => {
    loadDatabaseStats();
    loadTables();
    loadRealTimeData();
    const savedLanguage = localStorage.getItem('language') || 'ar';
    setLanguage(savedLanguage);
    
    // Set up real-time monitoring
    const interval = setInterval(() => {
      loadRealTimeData();
      loadDatabaseStats();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadRealTimeData = async () => {
    try {
      const response = await apiService.database.getRealTimeMetrics();
      if (response?.data?.success && response.data.data) {
        setRealTimeData(response.data.data);
        setLastRefresh(new Date());
      } else {
        console.warn('Database real-time metrics API returned empty or invalid response');
        // Use empty state instead of mock fallback
        setRealTimeData({
          queriesPerSecond: 0,
          activeConnections: 0,
          replicationLag: 0,
          cacheHitRatio: 0
        });
      }
    } catch (error) {
      console.error('Error loading real-time data:', error);
      // Use empty state instead of mock fallback
      setRealTimeData({
        queriesPerSecond: 0,
        activeConnections: 0,
        replicationLag: 0,
        cacheHitRatio: 0
      });
    }
  };

  const loadDatabaseStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.database.getStats();
      if (response?.data?.success && response.data.data) {
        setDbMetrics(response.data.data);
      } else {
        console.warn('Database stats API returned empty or invalid response');
        // Use empty state instead of mock fallback
        setDbMetrics({
          totalTables: 0,
          totalRecords: 0,
          storageUsed: '0 GB',
          connections: 0,
          uptime: '0 hours',
          performance: 0
        });
      }
    } catch (error) {
      console.error('Error loading database stats:', error);
      toast.error(language === 'ar' ? 'فشل تحميل إحصائيات قاعدة البيانات' : 'Failed to load database statistics');
      // Use empty state instead of mock fallback
      setDbMetrics({
        totalTables: 0,
        totalRecords: 0,
        storageUsed: '0 GB',
        connections: 0,
        uptime: '0 hours',
        performance: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async () => {
    try {
      const response = await apiService.database.getTables();
      if (response?.data?.success && response.data.data) {
        setTables(response.data.data);
      } else {
        console.warn('Database tables API returned empty or invalid response');
        // Use empty array instead of mock fallback
        setTables([]);
      }
    } catch (error) {
      console.error('Error loading database tables:', error);
      toast.error(language === 'ar' ? 'فشل تحميل جداول قاعدة البيانات' : 'Failed to load database tables');
      // Use empty array instead of mock fallback
      setTables([]);
    }
  };

  // Execute database query
  const executeQuery = async (query) => {
    try {
      const response = await apiService.database.executeQuery({ query });
      if (response?.data?.success) {
        setQueryResult(response.data.data);
        toast.success('Query executed successfully');
      }
    } catch (error) {
      console.error('Error executing query:', error);
      toast.error('Failed to execute query');
    }
  };

  // Handle query builder execution
  const handleQueryBuilderExecute = () => {
    const query = buildQueryFromBuilder();
    executeQuery(query);
  };

  // Build SQL query from builder state
  const buildQueryFromBuilder = () => {
    let query = 'SELECT ';
    query += queryBuilder.fields.join(', ') || '*';
    query += ` FROM ${queryBuilder.table}`;
    
    if (queryBuilder.conditions.length > 0) {
      query += ' WHERE ' + queryBuilder.conditions.map(cond => `${cond.field} ${cond.operator} '${cond.value}'`).join(' AND ');
    }
    
    if (queryBuilder.orderBy) {
      query += ` ORDER BY ${queryBuilder.orderBy}`;
    }
    
    if (queryBuilder.limit) {
      query += ` LIMIT ${queryBuilder.limit}`;
    }
    
    return query;
  };

  // Generate dynamic metrics array from API data
  const metrics = [
    {
      name: 'إجمالي الجداول',
      nameEn: 'Total Tables',
      value: dbMetrics.totalTables.toString(),
      icon: Table,
      color: 'blue',
      change: '+5%'
    },
    {
      name: 'إجمالي السجلات',
      nameEn: 'Total Records',
      value: dbMetrics.totalRecords.toLocaleString(),
      icon: BarChart3,
      color: 'green',
      change: '+8.3%'
    },
    {
      name: 'الاستعلامات/ثانية',
      nameEn: 'Queries/sec',
      value: realTimeData.queriesPerSecond.toLocaleString(),
      icon: Zap,
      color: 'yellow',
      change: realTimeData.queriesPerSecond > 800 ? '+15%' : '-5%'
    },
    {
      name: 'الاتصالات النشطة',
      nameEn: 'Active Connections',
      value: realTimeData.activeConnections.toString(),
      icon: Activity,
      color: 'purple',
      change: realTimeData.activeConnections > 50 ? '+2' : '-1'
    },
    {
      name: 'متوسط زمن الاستجابة',
      nameEn: 'Avg Response Time',
      value: `${(1000 / Math.max(realTimeData.queriesPerSecond, 1)).toFixed(1)}ms`,
      icon: Clock,
      color: 'indigo',
      change: '-12%'
    },
    {
      name: 'حالة النظام',
      nameEn: 'System Health',
      value: `${Math.max(85, Math.min(100, realTimeData.cacheHitRatio + 15)).toFixed(1)}%`,
      icon: CheckCircle,
      color: realTimeData.cacheHitRatio > 90 ? 'green' : 'yellow',
      change: realTimeData.cacheHitRatio > 90 ? 'صحي' : 'جيد'
    }
  ];

  // Database tables organized by category
  const tableGroups = [
    {
      name: 'الجداول الأساسية',
      nameEn: 'Core Tables',
      icon: Users,
      tables: tables.filter(table => ['users', 'organizations', 'tenants', 'roles'].includes(table.name))
    },
    {
      name: 'جداول الحوكمة والمخاطر',
      nameEn: 'GRC Tables',
      icon: Shield,
      tables: tables.filter(table => ['regulators', 'frameworks', 'controls', 'requirements'].includes(table.name))
    },
    {
      name: 'جداول التقييمات',
      nameEn: 'Assessment Tables',
      icon: Target,
      tables: tables.filter(table => ['assessments', 'responses', 'evidence', 'action_plans'].includes(table.name))
    },
    {
      name: 'جداول التقارير',
      nameEn: 'Reporting Tables',
      icon: FileText,
      tables: tables.filter(table => ['reports', 'dashboards', 'analytics', 'audit_logs'].includes(table.name))
    }
  ];

  // Sample query builder
  const [queryBuilder, setQueryBuilder] = useState({
    table: '',
    fields: ['*'],
    conditions: [],
    orderBy: '',
    limit: 100
  });

  const tabs = [
    { id: 'overview', name: 'نظرة عامة', nameEn: 'Overview', icon: Database },
    { id: 'tables', name: 'الجداول', nameEn: 'Tables', icon: Table },
    { id: 'queries', name: 'الاستعلامات', nameEn: 'Queries', icon: Code },
    { id: 'performance', name: 'الأداء', nameEn: 'Performance', icon: TrendingUp },
    { id: 'monitoring', name: 'المراقبة', nameEn: 'Monitoring', icon: MonitorSpeaker }
  ];

  return (
    <div className="space-y-4 md:space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            <ArabicTextEngine text="إدارة قاعدة البيانات" />
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            <ArabicTextEngine text="مراقبة وإدارة عمليات قاعدة البيانات والأداء" />
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-colors touch-manipulation text-sm md:text-base"
            aria-label="Create new query"
            type="button"
            onClick={() => setActiveTab('queries')}
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4" />
            <span>استعلام جديد</span>
          </motion.button>

          <button 
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors touch-manipulation text-sm md:text-base"
            aria-label="Export data"
            type="button"
            onClick={handleExportData}
          >
            <Download className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">تصدير البيانات</span>
            <span className="sm:hidden">تصدير</span>
          </button>

          <button 
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors touch-manipulation text-sm md:text-base"
            aria-label="Refresh data"
            type="button"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Advanced Components Section */}
      {hasPermission('view_database_analytics') && (
        <>
          {/* Quick Actions Toolbar */}
          <QuickActionsToolbar
            actions={[
              {
                label: 'New Query',
                icon: Plus,
                onClick: () => setActiveTab('queries'),
                permission: 'execute_database_queries'
              },
              {
                label: 'Export Data',
                icon: Download,
                onClick: handleExportData,
                permission: 'export_database_data'
              },
              {
                label: 'Refresh',
                icon: RefreshCw,
                onClick: handleRefresh,
                permission: 'view_database_metrics'
              }
            ]}
          />

          {/* Real-Time Monitor - Compact */}
          <RealTimeMonitor
            metrics={[
              {
                label: 'Queries/sec',
                value: realTimeData.queriesPerSecond,
                trend: 'up',
                status: 'healthy'
              },
              {
                label: 'Active Connections',
                value: realTimeData.activeConnections,
                trend: 'stable',
                status: 'healthy'
              },
              {
                label: 'Cache Hit Ratio',
                value: `${realTimeData.cacheHitRatio}%`,
                trend: realTimeData.cacheHitRatio > 90 ? 'up' : 'down',
                status: realTimeData.cacheHitRatio > 90 ? 'healthy' : 'warning'
              }
            ]}
          />

          {/* Role-Based Dashboard Cards - Collapsible */}
          <RoleDashboardCards
            title="Database Access Levels"
            collapsible={true}
            roleCards={[
              {
                title: 'Database Administrator',
                description: 'Full database management access',
                permissions: ['execute_database_queries', 'manage_database_users', 'configure_database_settings'],
                icon: Shield
              },
              {
                title: 'Database Analyst',
                description: 'Query and analytics access',
                permissions: ['execute_database_queries', 'view_database_analytics'],
                icon: BarChart3
              },
              {
                title: 'Database Viewer',
                description: 'Read-only database access',
                permissions: ['view_database_metrics'],
                icon: Eye
              }
            ]}
          />

          {/* Advanced Analytics Panel */}
          <AdvancedAnalyticsPanel
            charts={[
              {
                title: 'Query Performance',
                type: 'line',
                data: [
                  { name: '00:00', value: 120 },
                  { name: '04:00', value: 80 },
                  { name: '08:00', value: 200 },
                  { name: '12:00', value: 350 },
                  { name: '16:00', value: 280 },
                  { name: '20:00', value: 180 }
                ]
              },
              {
                title: 'Database Connections',
                type: 'bar',
                data: [
                  { name: 'Web App', value: 45 },
                  { name: 'API', value: 32 },
                  { name: 'Analytics', value: 18 },
                  { name: 'Backup', value: 5 }
                ]
              }
            ]}
          />
        </>
      )}

      {/* System Status Alert */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-lg md:rounded-xl p-3 md:p-4 flex items-center gap-2 md:gap-3"
      >
        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
        <div className="flex-1">
          <p className="font-medium text-green-800 text-sm md:text-base">قاعدة البيانات تعمل بصحة جيدة</p>
          <p className="text-xs md:text-sm text-green-700">جميع الخدمات متصلة • آخر نسخة احتياطية: منذ ساعتين</p>
        </div>
        <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-green-700">
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>متصل</span>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <motion.div
              key={metric.nameEn}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">
                    <ArabicTextEngine text={metric.name} />
                  </p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{metric.value}</p>
                  <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2">
                    <span className="text-xs md:text-sm text-green-600 font-medium">{metric.change}</span>
                    <span className="text-xs text-gray-500 hidden md:inline">{metric.nameEn}</span>
                  </div>
                </div>
                <div className={`p-2 md:p-3 bg-${metric.color}-50 rounded-lg md:rounded-xl`}>
                  <IconComponent className={`w-4 h-4 md:w-6 md:h-6 text-${metric.color}-600`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <nav className="flex overflow-x-auto space-x-2 md:space-x-8 px-3 md:px-6 scrollbar-hide" dir="ltr">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 md:gap-2 py-3 md:py-4 px-2 md:px-2 border-b-2 font-medium text-xs md:text-sm transition-colors whitespace-nowrap touch-manipulation ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-right" dir="rtl">
                    <ArabicTextEngine text={tab.name} />
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-3 md:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Database Schema Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <ArabicTextEngine text="هيكل قاعدة البيانات" />
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {tableGroups.map((group, index) => {
                    const IconComponent = group.icon;
                    return (
                      <motion.div
                        key={group.nameEn}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              <ArabicTextEngine text={group.name} />
                            </h4>
                            <p className="text-sm text-gray-600">{group.nameEn}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {group.tables.slice(0, 3).map((table) => (
                            <div key={table.name} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">
                                <ArabicTextEngine text={table.nameAr} />
                              </span>
                              <span className="text-gray-500">{table.records.toLocaleString('ar-SA')} سجل</span>
                            </div>
                          ))}
                          {group.tables.length > 3 && (
                            <p className="text-sm text-blue-600 cursor-pointer hover:underline">
                              +{group.tables.length - 3} جداول أخرى
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  <ArabicTextEngine text="استعراض الجداول" />
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="البحث في الجداول..."
                      className="ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      dir="rtl"
                    />
                  </div>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tables List */}
              <div className="space-y-4">
                {tableGroups.map((group) => (
                  <div key={group.nameEn} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <group.icon className="w-4 h-4" />
                        <ArabicTextEngine text={group.name} />
                      </h4>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {group.tables.map((table) => (
                        <motion.div
                          key={table.name}
                          whileHover={{ backgroundColor: '#f9fafb' }}
                          className="p-4 cursor-pointer"
                          onClick={() => setSelectedTable(table)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Table className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">{table.name}</p>
                                <p className="text-sm text-gray-600">
                                  <ArabicTextEngine text={table.nameAr} />
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <span>{table.records.toLocaleString('ar-SA')} سجل</span>
                              <span>{table.size}</span>
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                <Edit className="w-4 h-4" />
                                <Download className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'queries' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                <ArabicTextEngine text="منشئ الاستعلامات" />
              </h3>

              {/* Query Builder Interface */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ArabicTextEngine text="الجدول" />
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={queryBuilder.table}
                      onChange={(e) => setQueryBuilder({...queryBuilder, table: e.target.value})}
                    >
                      <option value="">اختر جدول...</option>
                      {tables.map(table => (
                        <option key={table.name} value={table.name}>
                          {table.nameAr} ({table.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ArabicTextEngine text="الحقول" />
                    </label>
                    <input
                      type="text"
                      placeholder="id, name, created_at"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      dir="ltr"
                      value={queryBuilder.fields.join(', ')}
                      onChange={(e) => setQueryBuilder({...queryBuilder, fields: e.target.value ? e.target.value.split(',').map(f => f.trim()) : ['*']})}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ArabicTextEngine text="الاستعلام" />
                  </label>
                  <textarea
                    rows="4"
                    placeholder="SELECT * FROM users WHERE status = 'active' ORDER BY created_at DESC LIMIT 100"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    dir="ltr"
                    value={buildQueryFromBuilder()}
                    onChange={(e) => {
                      // Allow manual query editing
                      const manualQuery = e.target.value;
                      // You could parse this and update queryBuilder state here
                    }}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={handleQueryBuilderExecute}
                    disabled={!queryBuilder.table}
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>تنفيذ</span>
                  </motion.button>

                  <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <PauseCircle className="w-4 h-4" />
                    <span>إيقاف</span>
                  </button>

                  <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>حفظ النتيجة</span>
                  </button>
                </div>
              </div>

              {/* Query Results */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">نتائج الاستعلام</h4>
                </div>
                <div className="p-4">
                  {queryResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>تم إرجاع {queryResult.length || 0} سجل</span>
                        <button 
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(queryResult, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `query-results-${new Date().toISOString().split('T')[0]}.json`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Download className="w-4 h-4 inline mr-1" />
                          تصدير النتائج
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {queryResult.length > 0 && Object.keys(queryResult[0]).map(key => (
                                <th key={key} className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {queryResult.map((row, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                {Object.values(row).map((value, i) => (
                                  <td key={i} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      <ArabicTextEngine text="لم يتم تنفيذ أي استعلام بعد" />
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                <ArabicTextEngine text="مراقبة الأداء" />
              </h3>

              {/* Performance Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-xl p-6">
                  <h4 className="font-medium text-gray-900 mb-4">
                    <ArabicTextEngine text="زمن الاستجابة" />
                  </h4>
                  <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-6">
                  <h4 className="font-medium text-gray-900 mb-4">
                    <ArabicTextEngine text="استخدام الموارد" />
                  </h4>
                  <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Activity className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                <ArabicTextEngine text="مراقبة النظام" />
              </h3>

              {/* System Health Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">قاعدة البيانات</p>
                      <p className="text-sm text-green-700">صحية</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">الاتصالات</p>
                      <p className="text-sm text-green-700">مستقرة</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">النسخ الاحتياطي</p>
                      <p className="text-sm text-yellow-700">متأخر قليلاً</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabasePage;
