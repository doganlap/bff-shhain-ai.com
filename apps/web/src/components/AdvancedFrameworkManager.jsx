import React, { useState, useEffect } from 'react';
import { 
  Shield, Target, Building2, Globe, Search, Filter,
  ChevronDown, ChevronRight, Eye, Edit, Download,
  Plus, FileText, Users, BarChart3, AlertCircle,
  CheckCircle, Clock, XCircle, Settings, Zap, Trash2
} from 'lucide-react';
import apiService from '../services/apiEndpoints';
import { toast } from 'sonner';

const AdvancedFrameworkManager = () => {
  const [frameworks, setFrameworks] = useState([]);
  const [regulators, setRegulatorsData] = useState([]);
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [frameworkControls, setFrameworkControls] = useState([]);
  const [expandedFrameworks, setExpandedFrameworks] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [controlsLoading, setControlsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    regulator: '',
    country: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [frameworksRes, regulatorsRes] = await Promise.all([
        apiService.frameworks.getAll(),
        apiService.regulators.getAll()
      ]);

      setFrameworks(frameworksRes.data || frameworksRes || []);
      setRegulatorsData(regulatorsRes.data || regulatorsRes || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load frameworks data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFrameworkControls = async (frameworkId) => {
    try {
      setControlsLoading(true);
      const response = await apiService.frameworks.getControls(frameworkId);
      setFrameworkControls(response.data || response || []);
    } catch (error) {
      console.error('Error fetching controls:', error);
      setFrameworkControls([]);
    } finally {
      setControlsLoading(false);
    }
  };

  // CRUD Operations
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    regulator_id: '',
    country: '',
    version: '1.0',
    is_active: true
  });

  const handleCreateFramework = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.frameworks.create(formData);
      if (response.data?.success || response.success) {
        toast.success('Framework created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error creating framework:', error);
      toast.error('Failed to create framework');
    }
  };

  const handleUpdateFramework = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.frameworks.update(selectedFramework.id, formData);
      if (response.data?.success || response.success) {
        toast.success('Framework updated successfully!');
        setShowEditModal(false);
        resetForm();
        setSelectedFramework(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating framework:', error);
      toast.error('Failed to update framework');
    }
  };

  const handleDeleteFramework = async () => {
    try {
      const response = await apiService.frameworks.delete(selectedFramework.id);
      if (response.data?.success || response.success) {
        toast.success('Framework deleted successfully!');
        setShowDeleteModal(false);
        setSelectedFramework(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting framework:', error);
      toast.error('Failed to delete framework');
    }
  };

  const handleUpdateStatus = async (frameworkId, isActive) => {
    try {
      const response = await apiService.frameworks.updateStatus(frameworkId, { is_active: isActive });
      if (response.data?.success || response.success) {
        toast.success(`Framework ${isActive ? 'activated' : 'deactivated'} successfully!`);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating framework status:', error);
      toast.error('Failed to update framework status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      regulator_id: '',
      country: '',
      version: '1.0',
      is_active: true
    });
  };

  const openEditModal = (framework) => {
    setSelectedFramework(framework);
    setFormData({
      name: framework.name || '',
      description: framework.description || '',
      regulator_id: framework.regulator_id || '',
      country: framework.country || '',
      version: framework.version || '1.0',
      is_active: framework.is_active !== false
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (framework) => {
    setSelectedFramework(framework);
    setShowDeleteModal(true);
  };

  const toggleFrameworkExpansion = async (framework) => {
    const newExpanded = new Set(expandedFrameworks);
    
    if (expandedFrameworks.has(framework.id)) {
      newExpanded.delete(framework.id);
      setExpandedFrameworks(newExpanded);
      if (selectedFramework?.id === framework.id) {
        setSelectedFramework(null);
        setFrameworkControls([]);
      }
    } else {
      newExpanded.add(framework.id);
      setExpandedFrameworks(newExpanded);
      setSelectedFramework(framework);
      await fetchFrameworkControls(framework.id);
    }
  };

  const getRegulatorInfo = (regulatorId) => {
    return regulators.find(reg => reg.id === regulatorId) || {};
  };

  const getFrameworkStatusBadge = (framework) => {
    const isActive = framework.is_active;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getCriticalityColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredFrameworks = frameworks.filter(framework => {
    const matchesSearch = !filters.search || 
      framework.name_en?.toLowerCase().includes(filters.search.toLowerCase()) ||
      framework.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      framework.framework_code?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesRegulator = !filters.regulator || framework.authority === filters.regulator;
    const matchesCountry = !filters.country || framework.country === filters.country;
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && framework.is_active) ||
      (filters.status === 'inactive' && !framework.is_active);

    return matchesSearch && matchesRegulator && matchesCountry && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Framework Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Framework Management</h1>
              <p className="text-gray-600">Manage compliance frameworks and their controls</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export Frameworks
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Import Framework
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{frameworks.length}</p>
                <p className="text-sm text-gray-600">Total Frameworks</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {frameworks.reduce((acc, fw) => acc + (fw.control_count || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Total Controls</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{regulators.length}</p>
                <p className="text-sm text-gray-600">Regulators</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(frameworks.map(fw => fw.country)).size}
                </p>
                <p className="text-sm text-gray-600">Countries</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search frameworks..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filters.regulator}
              onChange={(e) => setFilters({...filters, regulator: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Regulators</option>
              {regulators.map(regulator => (
                <option key={regulator.id} value={regulator.code}>
                  {regulator.name} ({regulator.code})
                </option>
              ))}
            </select>

            <select
              value={filters.country}
              onChange={(e) => setFilters({...filters, country: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Countries</option>
              {Array.from(new Set(frameworks.map(fw => fw.country))).map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="all">All Statuses</option>
            </select>
          </div>
        </div>

        {/* Frameworks List */}
        <div className="space-y-4">
          {filteredFrameworks.map((framework) => (
            <div key={framework.id} className="bg-white rounded-lg shadow-sm border">
              {/* Framework Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleFrameworkExpansion(framework)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {expandedFrameworks.has(framework.id) ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {framework.name_en || framework.name}
                        </h3>
                        <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {framework.framework_code}
                        </span>
                        {getFrameworkStatusBadge(framework)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4" />
                          <span>{framework.authority}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>{framework.country}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Version {framework.version}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4" />
                          <span>{frameworkControls.length || 0} Controls</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle view action
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle edit action
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>

              {/* Framework Controls (Expanded) */}
              {expandedFrameworks.has(framework.id) && (
                <div className="border-t bg-gray-50">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">Framework Controls</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {frameworkControls.length} controls found
                        </span>
                      </div>
                    </div>

                    {controlsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600">Loading controls...</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 max-h-96 overflow-y-auto">
                        {frameworkControls.map((control, index) => (
                          <div key={control.id || index} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    {control.control_id}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${getCriticalityColor(control.criticality_level)}`}>
                                    {control.criticality_level || 'Medium'}
                                  </span>
                                  {control.is_mandatory && (
                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                      Mandatory
                                    </span>
                                  )}
                                </div>
                                
                                <h5 className="font-medium text-gray-900 mb-1">
                                  {control.title_en || control.title}
                                </h5>
                                
                                <p className="text-sm text-gray-600 mb-2">
                                  {(control.description_en || control.description || '').substring(0, 150)}...
                                </p>
                                
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>Category: {control.category}</span>
                                  <span>Type: {control.control_type}</span>
                                  {control.implementation_guidance && (
                                    <span className="text-green-600">Has Guidance</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="ml-4 flex items-center space-x-2">
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-800">
                                  <Edit className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {frameworkControls.length === 0 && (
                          <div className="text-center py-8">
                            <Target className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No controls found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              This framework doesn't have any controls loaded yet.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFrameworks.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No frameworks found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or import new frameworks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFrameworkManager;
