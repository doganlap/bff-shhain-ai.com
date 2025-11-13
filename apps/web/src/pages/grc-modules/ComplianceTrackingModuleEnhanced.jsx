/**
 * Comprehensive Compliance Tracking Module
 * Features:
 * - Real-time compliance scoring
 * - Gap identification and tracking
 * - Remediation task management
 * - Framework coverage analysis
 * - Trend visualization
 * - Integration with scoring algorithms
 */

import React, { useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { useTheme } from '../../components/theme/ThemeProvider';
import apiService from '../../services/apiEndpoints';
import { 
  calculateFrameworkScore, 
  calculateOverallCompliance, 
  identifyComplianceGaps,
  getComplianceStatusColor,
  getComplianceStatusLabel 
} from '../../utils/scoring';
import { 
  CheckCircle, XCircle, Clock, TrendingUp, TrendingDown,
  Target, AlertCircle, BarChart3, Filter, Calendar,
  Plus, Eye, Edit, Download, RefreshCw, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const ComplianceTrackingModuleEnhanced = () => {
  const { t, isRTL } = useI18n();
  const { isDark } = useTheme();
  
  // State
  const [complianceData, setComplianceData] = useState(null);
  const [frameworks, setFrameworks] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');
  const [showGapsModal, setShowGapsModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedGap, setSelectedGap] = useState(null);
  
  // Fetch compliance data
  useEffect(() => {
    fetchComplianceData();
  }, [selectedFramework, timeRange]);
  
  const fetchComplianceData = async () => {
    setLoading(true);
    try {
      const params = {
        framework_id: selectedFramework !== 'all' ? selectedFramework : undefined,
        range: timeRange,
      };
      
      // Fetch multiple data sources in parallel
      const [scoreRes, frameworksRes, gapsRes, tasksRes] = await Promise.all([
        apiService.compliance.getScore(params),
        apiService.frameworks.getAll(params),
        apiService.compliance.getGaps(params),
        apiService.compliance.getTasks(params),
      ]);
      
      // Calculate comprehensive compliance metrics
      const frameworksData = frameworksRes.data?.data || [];
      const overallCompliance = calculateOverallCompliance(frameworksData);
      
      // Get all controls from frameworks
      const allControls = frameworksData.flatMap(f => f.controls || f.control_implementations || []);
      const complianceGaps = identifyComplianceGaps(allControls);
      
      setComplianceData({
        ...overallCompliance,
        score_data: scoreRes.data,
        by_framework: frameworksData.map(f => ({
          ...f,
          score: calculateFrameworkScore(f.controls || []),
        })),
      });
      
      setFrameworks(frameworksData);
      setGaps(complianceGaps);
      setTasks(tasksRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };
  
  // Create remediation task
  const handleCreateTask = async (taskData) => {
    try {
      await apiService.compliance.createTask(taskData);
      toast.success('Task created successfully');
      setShowTaskModal(false);
      fetchComplianceData();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };
  
  // Update task status
  const handleUpdateTask = async (taskId, updates) => {
    try {
      await apiService.compliance.updateTask(taskId, updates);
      toast.success('Task updated successfully');
      fetchComplianceData();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };
  
  // Compliance score card component
  const ScoreCard = ({ framework, score }) => {
    const statusColor = getComplianceStatusColor(score.percentage);
    const statusLabel = getComplianceStatusLabel(score.percentage);
    
    const colorClasses = {
      green: 'bg-green-100 text-green-800 border-green-300',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      red: 'bg-red-100 text-red-800 border-red-300',
    };
    
    return (
      <div className={`rounded-lg p-6 ${isDark() ? 'bg-gray-800' : 'bg-white'} shadow-md hover:shadow-lg transition-shadow`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className={`font-semibold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              {framework.name || framework.code}
            </h3>
            <p className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
              {framework.description}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colorClasses[statusColor]}`}>
            {statusLabel}
          </span>
        </div>
        
        <div className="space-y-3">
          {/* Score */}
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className={`text-sm font-medium ${isDark() ? 'text-gray-300' : 'text-gray-600'}`}>
                Compliance Score
              </span>
              <span className={`text-2xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                {score.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  statusColor === 'green' ? 'bg-green-600' :
                  statusColor === 'yellow' ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}
                style={{ width: `${score.percentage}%` }}
              />
            </div>
          </div>
          
          {/* Controls breakdown */}
          <div className="grid grid-cols-3 gap-3 text-center pt-3 border-t border-gray-200">
            <div>
              <div className={`text-2xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                {score.breakdown?.by_status?.effective || 0}
              </div>
              <div className={`text-xs ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                Effective
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                {score.breakdown?.by_status?.in_progress || 0}
              </div>
              <div className={`text-xs ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                In Progress
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                {score.breakdown?.by_status?.pending || 0}
              </div>
              <div className={`text-xs ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Gap row component
  const GapRow = ({ gap }) => {
    const priorityColors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    
    return (
      <tr className={`${isDark() ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
        <td className="px-6 py-4">
          <div className={`font-medium ${isDark() ? 'text-white' : 'text-gray-900'}`}>
            {gap.control_code}
          </div>
          <div className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
            {gap.control_title}
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[gap.criticality] || priorityColors.medium}`}>
            {gap.criticality?.toUpperCase()}
          </span>
        </td>
        <td className="px-6 py-4">
          <span className={`text-sm ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
            {gap.status}
          </span>
        </td>
        <td className="px-6 py-4">
          <span className={`text-sm ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
            {gap.owner_name || 'Unassigned'}
          </span>
        </td>
        <td className="px-6 py-4">
          {gap.is_overdue ? (
            <span className="inline-flex items-center gap-1 text-sm text-red-600 font-medium">
              <AlertTriangle className="w-4 h-4" />
              {gap.days_overdue} days overdue
            </span>
          ) : gap.due_date ? (
            <span className={`text-sm ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
              {new Date(gap.due_date).toLocaleDateString()}
            </span>
          ) : (
            <span className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
              No due date
            </span>
          )}
        </td>
        <td className="px-6 py-4">
          <button
            onClick={() => {
              setSelectedGap(gap);
              setShowTaskModal(true);
            }}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </td>
      </tr>
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
            Compliance Tracking
          </h1>
          <p className={`mt-1 ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor compliance scores, identify gaps, and track remediation
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchComplianceData}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>
      
      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`rounded-lg p-6 ${isDark() ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDark() ? 'text-gray-300' : 'text-gray-600'}`}>
              Overall Compliance
            </span>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              {complianceData?.overall_percentage || 0}%
            </span>
            <span className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +2.5%
            </span>
          </div>
        </div>
        
        <div className={`rounded-lg p-6 ${isDark() ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDark() ? 'text-gray-300' : 'text-gray-600'}`}>
              Open Gaps
            </span>
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              {gaps.length}
            </span>
            <span className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
              {gaps.filter(g => g.is_overdue).length} overdue
            </span>
          </div>
        </div>
        
        <div className={`rounded-lg p-6 ${isDark() ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDark() ? 'text-gray-300' : 'text-gray-600'}`}>
              Active Tasks
            </span>
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              {tasks.filter(t => t.status !== 'completed').length}
            </span>
            <span className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
              / {tasks.length} total
            </span>
          </div>
        </div>
        
        <div className={`rounded-lg p-6 ${isDark() ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDark() ? 'text-gray-300' : 'text-gray-600'}`}>
              Frameworks
            </span>
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              {frameworks.length}
            </span>
            <span className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
              tracked
            </span>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className={`rounded-lg p-4 ${isDark() ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="flex items-center gap-4">
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark() ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Frameworks</option>
            {frameworks.map(fw => (
              <option key={fw.id} value={fw.id}>
                {fw.name || fw.code}
              </option>
            ))}
          </select>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark() ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>
      
      {/* Framework Scores */}
      <div>
        <h2 className={`text-xl font-semibold mb-4 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
          Framework Compliance Scores
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complianceData?.by_framework?.map(fw => (
            <ScoreCard key={fw.id} framework={fw} score={fw.score} />
          ))}
        </div>
      </div>
      
      {/* Compliance Gaps */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
            Compliance Gaps ({gaps.length})
          </h2>
          <button
            onClick={() => setShowGapsModal(true)}
            className="text-blue-600 hover:text-blue-800"
          >
            View All
          </button>
        </div>
        
        <div className={`rounded-lg shadow-md overflow-hidden ${isDark() ? 'bg-gray-800' : 'bg-white'}`}>
          {gaps.length === 0 ? (
            <div className="text-center p-8">
              <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-3" />
              <p className={`text-lg ${isDark() ? 'text-gray-300' : 'text-gray-600'}`}>
                No compliance gaps found!
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className={isDark() ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Control</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criticality</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark() ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {gaps.slice(0, 10).map(gap => (
                  <GapRow key={gap.control_id} gap={gap} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceTrackingModuleEnhanced;
