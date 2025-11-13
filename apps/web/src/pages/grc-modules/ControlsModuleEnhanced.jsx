/**
 * Comprehensive Controls Management Module
 * Features:
 * - Control lifecycle management
 * - Implementation tracking
 * - Evidence management
 * - Testing & validation
 * - Effectiveness assessment
 * - Multi-framework mapping
 */

import React, { useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { useTheme } from '../../components/theme/ThemeProvider';
import apiService from '../../services/apiEndpoints';
import { calculateControlScore } from '../../utils/scoring';
import { 
  Target, Search, Filter, Download, Plus, Eye, Edit,
  AlertCircle, CheckCircle, Clock, Shield, FileText,
  AlertTriangle, Upload, Paperclip, PlayCircle, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const ControlsModuleEnhanced = () => {
  const { t, isRTL } = useI18n();
  const { isDark } = useTheme();
  
  // State
  const [controls, setControls] = useState([]);
  const [selectedControl, setSelectedControl] = useState(null);
  const [frameworks, setFrameworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [filters, setFilters] = useState({
    framework_id: 'all',
    status: 'all',
    criticality: 'all',
    owner: 'all',
    search: '',
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  
  // Fetch controls
  useEffect(() => {
    fetchControls();
    fetchFrameworks();
  }, [filters, pagination.page]);
  
  const fetchControls = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };
      
      const response = await apiService.controls.getAll(params);
      const controlsData = response.data?.data || [];
      
      // Enrich with score calculation
      const enrichedControls = controlsData.map(ctrl => ({
        ...ctrl,
        score: calculateControlScore(ctrl),
      }));
      
      setControls(enrichedControls);
      setPagination(prev => ({
        ...prev,
        total: response.data?.pagination?.total || 0,
      }));
    } catch (error) {
      console.error('Error fetching controls:', error);
      toast.error('Failed to load controls');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchFrameworks = async () => {
    try {
      const response = await apiService.frameworks.getAll();
      setFrameworks(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching frameworks:', error);
    }
  };
  
  // View control details
  const handleViewDetails = async (control) => {
    try {
      const [detailsRes, implementationRes] = await Promise.all([
        apiService.controls.getById(control.id),
        apiService.controls.getImplementation(control.id),
      ]);
      
      setSelectedControl({
        ...detailsRes.data,
        implementation: implementationRes.data || {},
      });
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching control details:', error);
      toast.error('Failed to load control details');
    }
  };
  
  // Update implementation
  const handleUpdateImplementation = async (controlId, data) => {
    try {
      await apiService.controls.updateImplementation(controlId, data);
      toast.success('Implementation updated successfully');
      fetchControls();
    } catch (error) {
      console.error('Error updating implementation:', error);
      toast.error('Failed to update implementation');
    }
  };
  
  // Add evidence
  const handleAddEvidence = async (controlId, evidence) => {
    try {
      await apiService.controls.addEvidence(controlId, evidence);
      toast.success('Evidence added successfully');
      setShowEvidenceModal(false);
      fetchControls();
    } catch (error) {
      console.error('Error adding evidence:', error);
      toast.error('Failed to add evidence');
    }
  };
  
  // Create test
  const handleCreateTest = async (controlId, test) => {
    try {
      await apiService.controls.createTest(controlId, test);
      toast.success('Test created successfully');
      setShowTestModal(false);
      fetchControls();
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error('Failed to create test');
    }
  };
  
  // Status Badge
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      effective: { label: 'Effective', color: 'bg-green-600', icon: CheckCircle },
      in_progress: { label: 'In Progress', color: 'bg-blue-600', icon: Clock },
      pending: { label: 'Pending', color: 'bg-yellow-600', icon: AlertCircle },
      not_started: { label: 'Not Started', color: 'bg-gray-600', icon: AlertTriangle },
      na: { label: 'N/A', color: 'bg-gray-400', icon: FileText },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };
  
  // Criticality Badge
  const CriticalityBadge = ({ criticality }) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300',
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${colors[criticality] || colors.medium}`}>
        {criticality?.toUpperCase()}
      </span>
    );
  };
  
  // Control Row Component
  const ControlRow = ({ control }) => {
    return (
      <tr
        className={`${isDark() ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-pointer`}
        onClick={() => handleViewDetails(control)}
      >
        <td className="px-6 py-4">
          <div>
            <div className={`font-medium ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              {control.code}
            </div>
            <div className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'} line-clamp-1`}>
              {control.title}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`text-sm ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
            {control.framework_code || control.framework_name}
          </span>
        </td>
        <td className="px-6 py-4">
          <CriticalityBadge criticality={control.criticality} />
        </td>
        <td className="px-6 py-4">
          <StatusBadge status={control.status} />
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(control.score?.score || 0) * 100}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
              {Math.round((control.score?.score || 0) * 100)}%
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`text-sm ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
            {control.owner_name || 'Unassigned'}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleViewDetails(control)}
              className="p-1 text-blue-600 hover:text-blue-800"
              title="View Details"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setSelectedControl(control);
                setShowEvidenceModal(true);
              }}
              className="p-1 text-green-600 hover:text-green-800"
              title="Add Evidence"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setSelectedControl(control);
                setShowTestModal(true);
              }}
              className="p-1 text-purple-600 hover:text-purple-800"
              title="Create Test"
            >
              <PlayCircle className="w-5 h-5" />
            </button>
          </div>
        </td>
      </tr>
    );
  };
  
  // Summary Stats
  const stats = [
    {
      label: 'Total Controls',
      value: pagination.total,
      icon: Shield,
      color: 'bg-blue-600',
    },
    {
      label: 'Effective',
      value: controls.filter(c => c.status === 'effective').length,
      icon: CheckCircle,
      color: 'bg-green-600',
    },
    {
      label: 'In Progress',
      value: controls.filter(c => c.status === 'in_progress').length,
      icon: Clock,
      color: 'bg-orange-600',
    },
    {
      label: 'Critical Priority',
      value: controls.filter(c => c.criticality === 'critical').length,
      icon: AlertTriangle,
      color: 'bg-red-600',
    },
  ];
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
            Controls Management
          </h1>
          <p className={`mt-1 ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
            Track and manage compliance controls across frameworks
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchControls}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`rounded-lg p-6 ${isDark() ? 'bg-gray-800' : 'bg-white'} shadow-md`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDark() ? 'text-gray-300' : 'text-gray-600'}`}>
                  {stat.label}
                </span>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className={`text-3xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>
      
      {/* Filters */}
      <div className={`rounded-lg p-4 ${isDark() ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search controls..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark() 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
          
          <select
            value={filters.framework_id}
            onChange={(e) => setFilters({ ...filters, framework_id: e.target.value })}
            className={`px-4 py-2 rounded-lg border ${
              isDark() ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Frameworks</option>
            {frameworks.map(fw => (
              <option key={fw.id} value={fw.id}>{fw.name || fw.code}</option>
            ))}
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className={`px-4 py-2 rounded-lg border ${
              isDark() ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Statuses</option>
            <option value="effective">Effective</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="not_started">Not Started</option>
          </select>
          
          <select
            value={filters.criticality}
            onChange={(e) => setFilters({ ...filters, criticality: e.target.value })}
            className={`px-4 py-2 rounded-lg border ${
              isDark() ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Criticality</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <button
            onClick={fetchControls}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Filter className="w-5 h-5" />
            Apply
          </button>
        </div>
      </div>
      
      {/* Controls Table */}
      <div className={`rounded-lg shadow-md overflow-hidden ${isDark() ? 'bg-gray-800' : 'bg-white'}`}>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : controls.length === 0 ? (
          <div className="text-center p-12">
            <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className={`text-lg ${isDark() ? 'text-gray-300' : 'text-gray-600'}`}>
              No controls found
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className={isDark() ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Control</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Framework</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criticality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effectiveness</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark() ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {controls.map(control => (
                <ControlRow key={control.id} control={control} />
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <div className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} controls
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded ${
                pagination.page === 1
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Previous
            </button>
            <span className={isDark() ? 'text-gray-300' : 'text-gray-700'}>
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className={`px-3 py-1 rounded ${
                pagination.page >= Math.ceil(pagination.total / pagination.limit)
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlsModuleEnhanced;
