import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, Download, Upload, Eye, Edit, Trash2,
  CheckCircle, XCircle, Clock, AlertTriangle, FileText,
  Users, Building2, Shield, Target, BarChart3, Settings, PackageX
} from 'lucide-react';
import apiService from '../services/apiEndpoints';
import { toast } from 'sonner';

const AdvancedAssessmentManager = () => {
  const [assessments, setAssessments] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [controls, setControls] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    framework: '',
    organization: '',
    search: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    organization_id: '',
    framework_id: '',
    assessment_type: 'internal',
    due_date: '',
    description: ''
  });

  const handleClearFilters = () => {
    setFilters({
      status: '',
      framework: '',
      organization: '',
      search: ''
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      organization_id: '',
      framework_id: '',
      assessment_type: 'internal',
      due_date: '',
      description: ''
    });
  };

  // CRUD Operations
  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.assessments.create(formData);
      if (response.data?.success) {
        toast.success('Assessment created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast.error('Failed to create assessment');
    }
  };

  const handleUpdateAssessment = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.assessments.update(selectedAssessment.id, formData);
      if (response.data?.success) {
        toast.success('Assessment updated successfully!');
        setShowEditModal(false);
        resetForm();
        setSelectedAssessment(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating assessment:', error);
      toast.error('Failed to update assessment');
    }
  };

  const handleDeleteAssessment = async () => {
    try {
      const response = await apiService.assessments.delete(selectedAssessment.id);
      if (response.data?.success) {
        toast.success('Assessment deleted successfully!');
        setShowDeleteModal(false);
        setSelectedAssessment(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast.error('Failed to delete assessment');
    }
  };

  const openEditModal = (assessment) => {
    setSelectedAssessment(assessment);
    setFormData({
      name: assessment.name || '',
      organization_id: assessment.organization_id || '',
      framework_id: assessment.framework_id || '',
      assessment_type: assessment.assessment_type || 'internal',
      due_date: assessment.due_date ? assessment.due_date.split('T')[0] : '',
      description: assessment.description || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (assessment) => {
    setSelectedAssessment(assessment);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [assessmentsRes, frameworksRes, organizationsRes] = await Promise.all([
        apiService.assessments.getAll(),
        apiService.frameworks.getAll(),
        apiService.organizations.getAll()
      ]);

      setAssessments(assessmentsRes.data?.data || []);
      setFrameworks(frameworksRes.data?.data || []);
      setOrganizations(organizationsRes.data?.data || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchControlsForFramework = async (frameworkId) => {
    try {
      const response = await apiService.frameworks.getControls(frameworkId);
      setControls(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching controls:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'in_progress':
        return <Clock size={18} className="text-blue-500 animate-spin" />;
      case 'draft':
        return <Edit size={18} className="text-gray-500" />;
      case 'overdue':
        return <AlertTriangle size={18} className="text-red-500" />;
      default:
        return <XCircle size={18} className="text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">Completed</span>;
      case 'In Progress':
        return <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">In Progress</span>;
      case 'Pending':
        return <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-900 dark:text-yellow-300">Pending</span>;
      case 'Cancelled':
        return <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full dark:bg-red-900 dark:text-red-300">Cancelled</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">Unknown</span>;
    }
  };

  const CreateAssessmentModal = () => (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800">Create New Assessment</h3>
            <button
              onClick={() => { setShowCreateModal(false); resetForm(); }}
              className="text-gray-400 hover:text-gray-600 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <XCircle className="h-7 w-7" />
            </button>
          </div>
          <p className="mt-1 text-gray-500">Fill in the details to start a new assessment.</p>
        </div>

        <form onSubmit={handleCreateAssessment} className="px-8 pb-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Q3 2024 ISO 27001 Audit"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization *
              </label>
              <select
                required
                value={formData.organization_id}
                onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Organization</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Framework *
              </label>
              <select
                required
                value={formData.framework_id}
                onChange={(e) => setFormData({ ...formData, framework_id: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Framework</option>
                {frameworks.map(framework => (
                  <option key={framework.id} value={framework.id}>
                    {framework.name_en || framework.name} ({framework.framework_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assessment Type
              </label>
              <select
                value={formData.assessment_type}
                onChange={(e) => setFormData({ ...formData, assessment_type: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="internal">Internal Assessment</option>
                <option value="external">External Audit</option>
                <option value="self">Self Assessment</option>
                <option value="third_party">Third Party Review</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Provide a brief description of the assessment's scope and objectives."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => { setShowCreateModal(false); resetForm(); }}
              className="px-6 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Assessment
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const EditAssessmentModal = () => (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800">Edit Assessment</h3>
            <button
              onClick={() => { setShowEditModal(false); resetForm(); setSelectedAssessment(null); }}
              className="text-gray-400 hover:text-gray-600 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <XCircle className="h-7 w-7" />
            </button>
          </div>
          <p className="mt-1 text-gray-500">Update the assessment details.</p>
        </div>

        <form onSubmit={handleUpdateAssessment} className="px-8 pb-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization *
              </label>
              <select
                required
                value={formData.organization_id}
                onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Organization</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Framework *
              </label>
              <select
                required
                value={formData.framework_id}
                onChange={(e) => setFormData({ ...formData, framework_id: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Framework</option>
                {frameworks.map(framework => (
                  <option key={framework.id} value={framework.id}>
                    {framework.name_en || framework.name} ({framework.framework_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assessment Type
              </label>
              <select
                value={formData.assessment_type}
                onChange={(e) => setFormData({ ...formData, assessment_type: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="internal">Internal Assessment</option>
                <option value="external">External Audit</option>
                <option value="self">Self Assessment</option>
                <option value="third_party">Third Party Review</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => { setShowEditModal(false); resetForm(); setSelectedAssessment(null); }}
              className="px-6 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Assessment
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800">Delete Assessment</h3>
            <button
              onClick={() => { setShowDeleteModal(false); setSelectedAssessment(null); }}
              className="text-gray-400 hover:text-gray-600 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <XCircle className="h-7 w-7" />
            </button>
          </div>
        </div>

        <div className="px-8 pb-8">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "<strong>{selectedAssessment?.name}</strong>"? This action cannot be undone.
          </p>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => { setShowDeleteModal(false); setSelectedAssessment(null); }}
              className="px-6 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAssessment}
              className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ControlsModal = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const framework = frameworks.find(f => f.id === selectedAssessment?.framework_id);

    const filteredControls = controls
      .filter(control => {
        const matchesCategory = categoryFilter ? control.category === categoryFilter : true;
        const matchesSearch = searchTerm ? 
          (control.title_en || control.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (control.description_en || control.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (control.control_id || '').toLowerCase().includes(searchTerm.toLowerCase())
          : true;
        return matchesCategory && matchesSearch;
      });
    
    const controlCategories = [...new Set(controls.map(c => c.category).filter(Boolean))];

    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col transform transition-all">
          <header className="px-8 py-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Assessment Controls</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Framework: <span className="font-semibold text-blue-600">{framework?.name_en || framework?.name}</span> | Assessment: <span className="font-semibold">{selectedAssessment?.name}</span>
                </p>
              </div>
              <button
                onClick={() => setShowControlsModal(false)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <XCircle className="h-7 w-7" />
              </button>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by ID, title, or description..."
                  className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {controlCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </header>
          
          <main className="flex-grow overflow-y-auto p-8 bg-gray-50">
            {filteredControls.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredControls.map(control => (
                  <div key={control.id} className="bg-white border border-gray-200 rounded-lg p-5 transition-shadow hover:shadow-lg">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {control.control_id}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${control.criticality_level === 'high' ? 'bg-red-100 text-red-800' : control.criticality_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {control.criticality_level || 'Medium'}
                          </span>
                          {control.is_mandatory && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Mandatory</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-1">{control.title_en || control.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{control.description_en || control.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Category: {control.category}</span>
                          <span>Type: {control.control_type}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <select className="text-sm border border-gray-300 rounded-md px-2 py-1.5 w-40">
                          <option value="">Not Assessed</option>
                          <option value="compliant">Compliant</option>
                          <option value="partially_compliant">Partially Compliant</option>
                          <option value="non_compliant">Non-Compliant</option>
                          <option value="not_applicable">Not Applicable</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <PackageX size={48} className="mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-800">No Controls Found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your search for "{searchTerm}" did not match any controls.
                </p>
              </div>
            )}
          </main>

          <footer className="px-8 py-5 bg-white border-t border-gray-200 flex justify-end space-x-4">
            <button
              onClick={() => setShowControlsModal(false)}
              className="px-6 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Close
            </button>
            <button className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Save Responses
            </button>
          </footer>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Assessment Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Assessment Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Track, manage, and analyze compliance assessments.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-12 w-full pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            value={filters.framework}
            onChange={(e) => setFilters({ ...filters, framework: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Frameworks</option>
            {frameworks.map((framework) => (
              <option key={framework.id} value={framework.id}>
                {framework.name_en || framework.name}
              </option>
            ))}
          </select>
          <select
            value={filters.organization}
            onChange={(e) => setFilters({ ...filters, organization: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Organizations</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {assessments.map((assessment) => (
          <div key={assessment.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(assessment.status)}
                    <h3 className="text-xl font-bold text-gray-800 truncate">
                      {assessment.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {assessment.framework_name || 'N/A'}
                  </p>
                </div>
                {getStatusBadge(assessment.status)}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Organization
                  </span>
                  <span className="font-medium text-gray-700">
                    {assessment.organization_name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Assessor
                  </span>
                  <span className="font-medium text-gray-700">
                    {assessment.assessor_name || 'Unassigned'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Controls
                  </span>
                  <span className="font-medium text-gray-700">
                    {assessment.control_count || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Due Date
                  </span>
                  <span className="font-medium text-gray-700">
                    {assessment.due_date ? new Date(assessment.due_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span className="font-semibold">{assessment.completion_percentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${assessment.completion_percentage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(assessment)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                  title="Edit Assessment"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openDeleteModal(assessment)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  title="Delete Assessment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={async () => {
                    setSelectedAssessment(assessment);
                    if (assessment.framework_id) {
                      await fetchControlsForFramework(assessment.framework_id);
                    }
                    setShowControlsModal(true);
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Assess
                </button>
                <button className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-gray-800 hover:bg-gray-900">
                  <Eye className="h-4 w-4 mr-2" />
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {assessments.length === 0 && !loading && (
        <div className="text-center py-20">
          <FileText className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-800">No Assessments Found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating a new assessment to track your compliance.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create First Assessment
            </button>
          </div>
        </div>
      )}

      {showCreateModal && <CreateAssessmentModal />}
      {showEditModal && <EditAssessmentModal />}
      {showDeleteModal && <DeleteConfirmationModal />}
      {showControlsModal && <ControlsModal />}
    </div>
  );
};

export default AdvancedAssessmentManager;
