import React, { useState, useEffect, useCallback } from 'react';
import EnterprisePageLayout from '../../components/layout/EnterprisePageLayout';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';
import {
  BarChart3, Download, Eye, Calendar, Shield, AlertTriangle,
  TrendingUp, FileText, RefreshCw, Grid, List, Search, Plus
} from 'lucide-react';
import { format } from 'date-fns';

const ReportsPage = () => {
  // State
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortField, setSortField] = useState('generatedDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [stats, setStats] = useState({});

  // Fetch data
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.reports.getRuns({
        search: searchTerm,
        type: filterBy !== 'all' ? filterBy : undefined
      });
      setReports(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterBy]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiService.reports.getStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [fetchReports, fetchStats]);

  // Calculate statistics
  const statsCards = [
    {
      title: 'Total Reports',
      value: stats.total || reports.length,
      icon: BarChart3,
      color: 'blue',
      trend: `${reports.length} generated`
    },
    {
      title: 'Compliance Reports',
      value: stats.compliance || reports.filter(r => r.type === 'compliance').length,
      icon: Shield,
      color: 'green',
      trend: 'Regulatory'
    },
    {
      title: 'Risk Reports',
      value: stats.risk || reports.filter(r => r.type === 'risk').length,
      icon: AlertTriangle,
      color: 'red',
      trend: 'Assessment'
    },
    {
      title: 'Executive Reports',
      value: stats.executive || reports.filter(r => r.type === 'executive').length,
      icon: TrendingUp,
      color: 'purple',
      trend: 'Summary'
    }
  ];

  // Filter and sort
  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.framework?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || report.type === filterBy;
    return matchesSearch && matchesFilter;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  // Handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDownload = async (reportId) => {
    try {
      await apiService.reports.download(reportId);
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const handleGenerateReport = () => {
    toast.info('Report generation feature coming soon');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'compliance': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'risk': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'executive': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'audit': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'compliance': return Shield;
      case 'risk': return AlertTriangle;
      case 'executive': return TrendingUp;
      case 'audit': return FileText;
      default: return BarChart3;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'generating': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Loading state
  if (loading && reports.length === 0) {
    return (
      <EnterprisePageLayout title="Reports" subtitle="Generate and manage compliance reports">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </EnterprisePageLayout>
    );
  }

  return (
    <EnterprisePageLayout
      title="Reports"
      subtitle="Generate and manage compliance, risk, and audit reports"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            className="px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </button>
          <button
            onClick={fetchReports}
            className="px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Generate Report
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.trend}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Reports</option>
              <option value="compliance">Compliance Reports</option>
              <option value="risk">Risk Reports</option>
              <option value="executive">Executive Reports</option>
              <option value="audit">Audit Reports</option>
            </select>
          </div>
        </div>

        {/* Grid or Table View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedReports.map((report) => {
              const TypeIcon = getTypeIcon(report.type);
              return (
                <div key={report.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <TypeIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {report.title || 'Untitled Report'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                      {report.type || 'Unknown'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status || 'unknown'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      {report.framework || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {report.generatedDate ? format(new Date(report.generatedDate), 'MMM dd, yyyy') : 'N/A'}
                    </div>
                  </div>

                  {/* Compliance Score */}
                  {report.complianceScore !== undefined && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Compliance Score</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{report.complianceScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${report.complianceScore}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Findings Summary */}
                  {(report.criticalFindings !== undefined || report.mediumFindings !== undefined || report.lowFindings !== undefined) && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">{report.criticalFindings || 0}</div>
                        <div className="text-xs text-red-600 dark:text-red-400">Critical</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{report.mediumFindings || 0}</div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-400">Medium</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">{report.lowFindings || 0}</div>
                        <div className="text-xs text-green-600 dark:text-green-400">Low</div>
                      </div>
                    </div>
                  )}

                  {/* File Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>{report.format || 'PDF'}</span>
                    <span>{report.size || 'N/A'}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
                      <Eye className="h-3 w-3 inline mr-1" />
                      Preview
                    </button>
                    {report.status === 'completed' && (
                      <button
                        onClick={() => handleDownload(report.id)}
                        className="flex-1 px-3 py-2 text-sm bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                      >
                        <Download className="h-3 w-3 inline mr-1" />
                        Download
                      </button>
                    )}
                    {report.status === 'generating' && (
                      <div className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-yellow-600 dark:text-yellow-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                        Generating...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th
                      onClick={() => handleSort('title')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('type')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Framework
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Score
                    </th>
                    <th
                      onClick={() => handleSort('generatedDate')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Generated {sortField === 'generatedDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {report.title || 'Untitled'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(report.type)}`}>
                          {report.type || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 dark:text-gray-300">{report.framework || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {report.complianceScore !== undefined ? `${report.complianceScore}%` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {report.generatedDate ? format(new Date(report.generatedDate), 'MMM dd, yyyy') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                          {report.status || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3">
                          <Eye className="h-4 w-4 inline" />
                        </button>
                        {report.status === 'completed' && (
                          <button
                            onClick={() => handleDownload(report.id)}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                          >
                            <Download className="h-4 w-4 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {sortedReports.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No reports found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try a different search term' : 'Get started by generating a new report'}
            </p>
            <div className="mt-6">
              <button
                onClick={handleGenerateReport}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </button>
            </div>
          </div>
        )}
      </div>
    </EnterprisePageLayout>
  );
};

export default ReportsPage;
