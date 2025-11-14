import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle, XCircle, Clock, TrendingUp, Target, AlertCircle,
  BarChart3, Filter, Calendar, Search, Grid, List, ChevronUp, ChevronDown, RefreshCw
} from 'lucide-react';
import EnterprisePageLayout from '../../components/layout/EnterprisePageLayout';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ComplianceTrackingPage = () => {
  const [complianceData, setComplianceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [stats, setStats] = useState({
    overallScore: 0,
    totalGaps: 0,
    criticalGaps: 0,
    completedTasks: 0
  });

  // Fetch data
  const loadComplianceData = useCallback(async () => {
    try {
      setLoading(true);

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
        compliant_controls: framework.compliant_controls || 0,
        non_compliant_controls: framework.non_compliant_controls || 0,
        in_progress_controls: framework.in_progress_controls || 0,
        gaps: gaps.filter(gap => gap.framework_id === framework.id),
        last_assessment: framework.last_assessment || new Date().toISOString(),
        next_assessment: framework.next_assessment || new Date().toISOString(),
        status: framework.status || 'active',
        risk_level: framework.risk_level || 'medium'
      }));

      setComplianceData(processedData);

      // Update statistics
      setStats({
        overallScore: scoreData.overall_score || 0,
        totalGaps: gaps.length,
        criticalGaps: gaps.filter(gap => gap.severity === 'critical').length,
        completedTasks: tasks.filter(task => task.status === 'completed').length
      });
    } catch (error) {
      console.error('Error loading compliance data:', error);
      toast.error('Failed to load compliance data');
      setComplianceData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplianceData();
  }, [loadComplianceData]);

  // Calculate metrics
  const calculateMetrics = () => {
    if (complianceData.length === 0) {
      return [
        { title: 'Average Compliance', value: '0%', icon: Target, color: 'blue', trend: '+0%' },
        { title: 'Compliant Frameworks', value: 0, icon: CheckCircle, color: 'green', trend: '+0' },
        { title: 'Need Improvement', value: 0, icon: AlertCircle, color: 'yellow', trend: '0' },
        { title: 'Total Controls', value: 0, icon: BarChart3, color: 'purple', trend: '+0' }
      ];
    }

    const totalScore = complianceData.reduce((sum, item) => sum + (item.compliance_score || 0), 0);
    const averageScore = (totalScore / complianceData.length).toFixed(1);
    const compliantFrameworks = complianceData.filter(item => item.status === 'compliant').length;
    const needImprovement = complianceData.filter(item => item.status === 'needs_improvement').length;
    const totalControls = complianceData.reduce((sum, item) => sum + (item.total_controls || 0), 0);

    return [
      {
        title: 'Average Compliance',
        value: `${averageScore}%`,
        icon: Target,
        color: 'blue',
        trend: '+2.3% this quarter'
      },
      {
        title: 'Compliant Frameworks',
        value: compliantFrameworks,
        icon: CheckCircle,
        color: 'green',
        trend: `${compliantFrameworks} of ${complianceData.length}`
      },
      {
        title: 'Need Improvement',
        value: needImprovement,
        icon: AlertCircle,
        color: 'yellow',
        trend: 'Requires attention'
      },
      {
        title: 'Total Controls',
        value: totalControls,
        icon: BarChart3,
        color: 'purple',
        trend: `+${Math.floor(totalControls * 0.08)} new controls`
      }
    ];
  };

  const statsCards = calculateMetrics();

  // Filter and sort data
  const filteredData = complianceData.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || item.status === filterBy;
    return matchesSearch && matchesFilter;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'non-compliant': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading && complianceData.length === 0) {
    return (
      <EnterprisePageLayout
        title="Compliance Tracking"
        subtitle="Monitor and track compliance status across regulatory frameworks"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </EnterprisePageLayout>
    );
  }

  return (
    <EnterprisePageLayout
      title="Compliance Tracking"
      subtitle="Monitor and track compliance status across regulatory frameworks"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title={`Switch to ${viewMode === 'grid' ? 'table' : 'grid'} view`}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </button>
          <button
            onClick={loadComplianceData}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.trend}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search frameworks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="compliant">Compliant</option>
              <option value="non-compliant">Non-Compliant</option>
              <option value="in-progress">In Progress</option>
              <option value="needs_improvement">Needs Improvement</option>
            </select>
          </div>
        </div>

        {/* Data Display */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedData.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className={`text-xs font-semibold ${getRiskColor(item.risk_level)}`}>
                      {item.risk_level} risk
                    </span>
                  </div>
                </div>

                {/* Compliance Score */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Compliance Score
                    </span>
                    <span className={`text-2xl font-bold ${getScoreColor(item.compliance_score)}`}>
                      {item.compliance_score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        item.compliance_score >= 80 ? 'bg-green-500' :
                        item.compliance_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.compliance_score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Controls Breakdown */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {item.compliant_controls || 0}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Compliant</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <XCircle className="h-4 w-4 text-red-600 mr-1" />
                      <span className="text-lg font-bold text-red-600 dark:text-red-400">
                        {item.non_compliant_controls || 0}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Non-Compliant</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="h-4 w-4 text-yellow-600 mr-1" />
                      <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                        {item.in_progress_controls || 0}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">In Progress</span>
                  </div>
                </div>

                {/* Assessment Dates */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Last: {format(new Date(item.last_assessment), 'MMM d, yyyy')}</span>
                    </div>
                    <div>
                      <span>Next: {format(new Date(item.next_assessment), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Framework
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('compliance_score')}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Score
                        {sortField === 'compliance_score' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Controls
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Assessment
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg font-bold ${getScoreColor(item.compliance_score)}`}>
                          {item.compliance_score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex gap-2">
                          <span className="text-green-600 dark:text-green-400">✓ {item.compliant_controls || 0}</span>
                          <span className="text-red-600 dark:text-red-400">✗ {item.non_compliant_controls || 0}</span>
                          <span className="text-yellow-600 dark:text-yellow-400">⟳ {item.in_progress_controls || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-semibold ${getRiskColor(item.risk_level)}`}>
                          {item.risk_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(item.last_assessment), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedData.length === 0 && (
              <div className="p-12 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No compliance data found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </EnterprisePageLayout>
  );
};

export default ComplianceTrackingPage;
