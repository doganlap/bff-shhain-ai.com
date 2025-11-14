import React, { useState, useEffect, useCallback } from 'react';
import EnterprisePageLayout from '../../components/layout/EnterprisePageLayout';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';
import { Shield, Plus, Eye, Edit, Globe, Building2, Search, Trash2, RefreshCw, Grid, List, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const RegulatorsPage = () => {
  // State
  const [regulators, setRegulators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [stats, setStats] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegulator, setEditingRegulator] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    jurisdiction: '',
    sector: '',
    description: '',
    is_active: true
  });

  // Fetch data
  const loadRegulators = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.regulators.getAll({
        search: searchTerm,
        status: filterBy !== 'all' ? filterBy : undefined
      });
      if (response?.data?.success && response.data.data) {
        setRegulators(response.data.data);
      } else {
        setRegulators(response.data?.data || response.data || []);
      }
    } catch (error) {
      console.error('Error loading regulators:', error);
      toast.error('Failed to load regulators');
      setRegulators([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterBy]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiService.regulators.getStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    loadRegulators();
    fetchStats();
  }, [loadRegulators, fetchStats]);

  // Calculate statistics
  const statsCards = [
    {
      title: 'Total Regulators',
      value: stats.total || regulators.length,
      icon: Shield,
      color: 'blue',
      trend: `${regulators.length} registered`
    },
    {
      title: 'Active',
      value: stats.active || regulators.filter(r => r.is_active).length,
      icon: CheckCircle,
      color: 'green',
      trend: 'Currently enforcing'
    },
    {
      title: 'Inactive',
      value: stats.inactive || regulators.filter(r => !r.is_active).length,
      icon: XCircle,
      color: 'red',
      trend: 'Not enforcing'
    },
    {
      title: 'Jurisdictions',
      value: stats.jurisdictions || new Set(regulators.map(r => r.jurisdiction)).size,
      icon: Globe,
      color: 'purple',
      trend: 'Unique regions'
    }
  ];

  // Filter and sort
  const filteredRegulators = regulators.filter(regulator => {
    const matchesSearch =
      regulator.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regulator.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regulator.jurisdiction?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' ||
      (filterBy === 'active' && regulator.is_active) ||
      (filterBy === 'inactive' && !regulator.is_active);
    return matchesSearch && matchesFilter;
  });

  const sortedRegulators = [...filteredRegulators].sort((a, b) => {
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

  const openModal = (regulator = null) => {
    if (regulator) {
      setEditingRegulator(regulator);
      setFormData({
        name: regulator.name,
        code: regulator.code,
        jurisdiction: regulator.jurisdiction,
        sector: regulator.sector,
        description: regulator.description,
        is_active: regulator.is_active
      });
    } else {
      setEditingRegulator(null);
      setFormData({
        name: '',
        code: '',
        jurisdiction: '',
        sector: '',
        description: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRegulator(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRegulator) {
        await apiService.regulators.update(editingRegulator.id, formData);
        toast.success('Regulator updated successfully');
      } else {
        await apiService.regulators.create(formData);
        toast.success('Regulator created successfully');
      }
      closeModal();
      loadRegulators();
      fetchStats();
    } catch (error) {
      console.error('Error saving regulator:', error);
      toast.error('Failed to save regulator');
    }
  };

  const handleDelete = async (regulatorId) => {
    if (window.confirm('Are you sure you want to delete this regulator?')) {
      try {
        await apiService.regulators.delete(regulatorId);
        toast.success('Regulator deleted successfully');
        loadRegulators();
        fetchStats();
      } catch (error) {
        console.error('Error deleting regulator:', error);
        toast.error('Failed to delete regulator');
      }
    }
  };

  // Loading state
  if (loading && regulators.length === 0) {
    return (
      <EnterprisePageLayout title="Regulators" subtitle="Manage regulatory authorities and frameworks">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </EnterprisePageLayout>
    );
  }

  return (
    <EnterprisePageLayout
      title="Regulators"
      subtitle="Manage regulatory authorities and their compliance frameworks"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            className="px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </button>
          <button
            onClick={loadRegulators}
            className="px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Regulator
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
                placeholder="Search regulators..."
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
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Grid or Table View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRegulators.map((regulator) => (
              <div key={regulator.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {regulator.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{regulator.code}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    regulator.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {regulator.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <Globe className="h-4 w-4 mr-2 text-gray-400" />
                    {regulator.jurisdiction}
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                    {regulator.sector || 'N/A'}
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {regulator.description || 'No description available'}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(regulator)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                  >
                    <Edit className="h-3 w-3 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(regulator.id)}
                    className="flex-1 px-3 py-2 text-sm bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                  >
                    <Trash2 className="h-3 w-3 inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th
                      onClick={() => handleSort('name')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('code')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Code {sortField === 'code' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('jurisdiction')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Jurisdiction {sortField === 'jurisdiction' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('sector')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Sector {sortField === 'sector' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                  {sortedRegulators.map((regulator) => (
                    <tr key={regulator.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {regulator.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 dark:text-gray-300">{regulator.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                          <Globe className="h-4 w-4 mr-2 text-gray-400" />
                          {regulator.jurisdiction}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                          <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                          {regulator.sector || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          regulator.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {regulator.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openModal(regulator)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                        >
                          <Edit className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(regulator.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {sortedRegulators.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No regulators found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try a different search term' : 'Get started by adding a new regulator'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => openModal()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Regulator
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingRegulator ? 'Edit Regulator' : 'Add New Regulator'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  name="code"
                  id="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Jurisdiction
                </label>
                <input
                  type="text"
                  name="jurisdiction"
                  id="jurisdiction"
                  value={formData.jurisdiction}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="sector" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sector
                </label>
                <input
                  type="text"
                  name="sector"
                  id="sector"
                  value={formData.sector}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingRegulator ? 'Save Changes' : 'Create Regulator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </EnterprisePageLayout>
  );
};

export default RegulatorsPage;
