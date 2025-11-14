/**
 * Regulatory Intelligence Enhanced Page
 * Full CRUD operations for regulatory intelligence management
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, AlertCircle, Calendar, Filter, RefreshCw, TrendingUp, Building2, 
  FileText, Download, Plus, Edit, Eye, Search,
  Clock, CheckCircle, XCircle, Mail
} from 'lucide-react';
import { useCRUD } from '../../hooks/useCRUD';
import { useRBAC } from '../../hooks/useRBAC';
import { regulatorsAPI } from '../../services/apiEndpoints';
import { useI18n } from '../../hooks/useI18n';
import { toast } from 'sonner';

const RegulatoryIntelligenceEnhancedPage = () => {
  const { t, isRTL } = useI18n();
  const { hasPermission } = useRBAC();
  
  // CRUD operations for regulators
  const {
    data: regulators,
    loading: regulatorsLoading,
    error: regulatorsError,
    create: createRegulator,
    update: updateRegulator,
    delete: deleteRegulator,
    refetch: refetchRegulators
  } = useCRUD(regulatorsAPI);

  // CRUD operations for regulatory changes
  const {
    data: regulatoryChanges,
    loading: changesLoading,
    create: createChange,
    refetch: refetchChanges
  } = useCRUD({
    getAll: (params) => regulatorsAPI.getRegulatoryFeed(params),
    create: (data) => regulatorsAPI.subscribeToRegulatoryUpdates(data),
    update: () => Promise.reject(new Error('Updates not supported for regulatory changes')),
    delete: () => Promise.reject(new Error('Deletion not supported for regulatory changes'))
  });

  // State management
  const [selectedRegulator, setSelectedRegulator] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegulatorModal, setShowRegulatorModal] = useState(false);
  const [showChangeModal] = useState(false);
  const [editingRegulator, setEditingRegulator] = useState(null);
  const [regulatoryStats, setRegulatoryStats] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Form states
  const [regulatorForm, setRegulatorForm] = useState({
    name: '',
    description: '',
    type: 'government',
    website: '',
    contactEmail: '',
    isActive: true
  });

  const [changeForm] = useState({
    title: '',
    description: '',
    regulator: '',
    urgency_level: 'medium',
    published_date: new Date().toISOString(),
    status: 'active'
  });

  // Load initial data
  useEffect(() => {
    loadRegulatoryData();
    loadCalendarEvents();
  }, [selectedRegulator, selectedUrgency]);

  const loadRegulatoryData = async () => {
    try {
      setStatsLoading(true);
      const statsResponse = await regulatorsAPI.getRegulatoryStats();
      setRegulatoryStats(statsResponse.data?.data || statsResponse.data || null);
    } catch (error) {
      console.error('Error loading regulatory stats:', error);
      setRegulatoryStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadCalendarEvents = async () => {
    try {
      setCalendarLoading(true);
      // This would typically use an organization ID from auth context
      const orgId = 1; // Placeholder
      const calendarResponse = await regulatorsAPI.getRegulatoryCalendar({ organizationId: orgId, days: 90 });
      setCalendarEvents(calendarResponse.data?.data || []);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      setCalendarEvents([]);
    } finally {
      setCalendarLoading(false);
    }
  };

  // Filter and search logic
  const filteredChanges = (regulatoryChanges || []).filter(change => {
    if (selectedRegulator !== 'all' && change.regulator !== selectedRegulator) return false;
    if (selectedUrgency !== 'all' && change.urgency_level !== selectedUrgency) return false;
    if (searchTerm && !change.title?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !change.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // CRUD handlers
  const handleCreateRegulator = async (e) => {
    e.preventDefault();
    try {
      await createRegulator(regulatorForm);
      toast.success(t('regulatory.regulatorCreated'));
      setShowRegulatorModal(false);
      resetRegulatorForm();
    } catch (error) {
      toast.error(t('regulatory.regulatorCreateError'));
    }
  };

  const handleUpdateRegulator = async (e) => {
    e.preventDefault();
    try {
      await updateRegulator(editingRegulator.id, regulatorForm);
      toast.success(t('regulatory.regulatorUpdated'));
      setShowRegulatorModal(false);
      setEditingRegulator(null);
      resetRegulatorForm();
    } catch (error) {
      toast.error(t('regulatory.regulatorUpdateError'));
    }
  };

  const handleDeleteRegulator = async (id) => {
    if (!window.confirm(t('regulatory.confirmDeleteRegulator'))) return;
    
    try {
      await deleteRegulator(id);
      toast.success(t('regulatory.regulatorDeleted'));
    } catch (error) {
      toast.error(t('regulatory.regulatorDeleteError'));
    }
  };

  const handleSubscribeToChange = async (changeData) => {
    try {
      await createChange(changeData);
      toast.success(t('regulatory.subscribedToUpdates'));
    } catch (error) {
      toast.error(t('regulatory.subscriptionError'));
    }
  };

  // Form handlers
  const resetRegulatorForm = () => {
    setRegulatorForm({
      name: '',
      description: '',
      type: 'government',
      website: '',
      contactEmail: '',
      isActive: true
    });
  };

  const openRegulatorEditModal = (regulator) => {
    setEditingRegulator(regulator);
    setRegulatorForm({
      name: regulator.name || '',
      description: regulator.description || '',
      type: regulator.type || 'government',
      website: regulator.website || '',
      contactEmail: regulator.contactEmail || '',
      isActive: regulator.isActive !== false
    });
    setShowRegulatorModal(true);
  };

  const openRegulatorCreateModal = () => {
    setEditingRegulator(null);
    resetRegulatorForm();
    setShowRegulatorModal(true);
  };

  // UI helpers
  const getUrgencyColor = (urgency) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[urgency] || colors.medium;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-gray-600" />;
      default: return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  if (regulatorsError && !regulators.length) {
    return (
      <div className={`min-h-screen bg-gray-50 p-6 flex items-center justify-center ${isRTL() ? 'rtl' : 'ltr'}`}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('message.error')}</h2>
          <p className="text-gray-600 mb-4">{regulatorsError}</p>
          <button onClick={refetchRegulators} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            {t('action.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 p-6 ${isRTL() ? 'rtl' : 'ltr'}`} dir={isRTL() ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="w-8 h-8 text-indigo-600" />
              {t('regulatory.intelligenceCenter')}
            </h1>
            <p className="text-gray-600 mt-1">{t('regulatory.intelligenceSubtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            {hasPermission('regulators.create') && (
              <button
                onClick={openRegulatorCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" />
                {t('regulatory.addRegulator')}
              </button>
            )}
            <button
              onClick={() => {
                refetchRegulators();
                refetchChanges();
                loadRegulatoryData();
              }}
              disabled={regulatorsLoading || changesLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${regulatorsLoading || changesLoading ? 'animate-spin' : ''}`} />
              {t('action.refresh')}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {regulatoryStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('regulatory.totalChanges')}</p>
                <p className="text-2xl font-bold text-gray-900">{regulatoryStats.total_changes || 0}</p>
              </div>
              <FileText className="w-10 h-10 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('regulatory.criticalChanges')}</p>
                <p className="text-2xl font-bold text-red-600">{regulatoryStats.critical_changes || 0}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('regulatory.thisWeek')}</p>
                <p className="text-2xl font-bold text-blue-600">{regulatoryStats.changes_last_week || 0}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('regulatory.totalRegulators')}</p>
                <p className="text-2xl font-bold text-green-600">{regulators?.length || 0}</p>
              </div>
              <Building2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('regulatory.searchChanges')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{t('action.filters')}:</span>
            </div>

            <select
              value={selectedRegulator}
              onChange={(e) => setSelectedRegulator(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">{t('regulatory.allRegulators')}</option>
              {regulators?.map(regulator => (
                <option key={regulator.id} value={regulator.name}>
                  {regulator.name}
                </option>
              ))}
            </select>

            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">{t('regulatory.allLevels')}</option>
              <option value="critical">{t('regulatory.critical')}</option>
              <option value="high">{t('regulatory.high')}</option>
              <option value="medium">{t('regulatory.medium')}</option>
              <option value="low">{t('regulatory.low')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regulatory Changes Feed */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                {t('regulatory.regulatoryChanges')}
                <span className="ml-auto text-sm text-gray-500">{filteredChanges.length} {t('regulatory.results')}</span>
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {changesLoading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">{t('message.loading')}</p>
                </div>
              ) : filteredChanges.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('regulatory.noChanges')}</h3>
                  <p className="text-gray-600 mb-4">{t('regulatory.noChangesDescription')}</p>
                </div>
              ) : (
                filteredChanges.map((change) => (
                  <div key={change.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(change.status)}
                          <h3 className="font-medium text-gray-900">{change.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(change.urgency_level)}`}>
                            {t(`regulatory.${change.urgency_level}`)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{change.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {change.regulator}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(change.published_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSubscribeToChange({ regulator_id: change.regulator, notification_types: [change.urgency_level] })}
                          className="p-2 text-gray-400 hover:text-indigo-600 transition"
                          title={t('regulatory.subscribe')}
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {/* Handle view details */}}
                          className="p-2 text-gray-400 hover:text-indigo-600 transition"
                          title={t('action.view')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Compliance Calendar */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                {t('regulatory.complianceCalendar')}
              </h2>
            </div>
            <div className="p-4">
              {calendarLoading ? (
                <div className="text-center py-4">
                  <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
                </div>
              ) : calendarEvents.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{t('regulatory.noUpcomingDeadlines')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {calendarEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Regulators Management */}
          {hasPermission('regulators.read') && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  {t('regulatory.regulators')}
                </h2>
              </div>
              <div className="p-4">
                {regulatorsLoading ? (
                  <div className="text-center py-4">
                    <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {regulators?.slice(0, 5).map((regulator) => (
                      <div key={regulator.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(regulator.isActive ? 'active' : 'inactive')}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{regulator.name}</p>
                            <p className="text-xs text-gray-500">{regulator.type}</p>
                          </div>
                        </div>
                        {hasPermission('regulators.update') && (
                          <button
                            onClick={() => openRegulatorEditModal(regulator)}
                            className="p-1 text-gray-400 hover:text-indigo-600 transition"
                            title={t('action.edit')}
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Regulator Modal */}
      {showRegulatorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingRegulator ? t('regulatory.editRegulator') : t('regulatory.addRegulator')}
            </h2>
            <form onSubmit={editingRegulator ? handleUpdateRegulator : handleCreateRegulator}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('regulatory.name')}</label>
                  <input
                    type="text"
                    value={regulatorForm.name}
                    onChange={(e) => setRegulatorForm({...regulatorForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('regulatory.description')}</label>
                  <textarea
                    value={regulatorForm.description}
                    onChange={(e) => setRegulatorForm({...regulatorForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('regulatory.type')}</label>
                  <select
                    value={regulatorForm.type}
                    onChange={(e) => setRegulatorForm({...regulatorForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="government">{t('regulatory.government')}</option>
                    <option value="financial">{t('regulatory.financial')}</option>
                    <option value="healthcare">{t('regulatory.healthcare')}</option>
                    <option value="technology">{t('regulatory.technology')}</option>
                    <option value="other">{t('regulatory.other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('regulatory.website')}</label>
                  <input
                    type="url"
                    value={regulatorForm.website}
                    onChange={(e) => setRegulatorForm({...regulatorForm, website: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('regulatory.contactEmail')}</label>
                  <input
                    type="email"
                    value={regulatorForm.contactEmail}
                    onChange={(e) => setRegulatorForm({...regulatorForm, contactEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={regulatorForm.isActive}
                    onChange={(e) => setRegulatorForm({...regulatorForm, isActive: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    {t('regulatory.active')}
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRegulatorModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  {editingRegulator ? t('action.update') : t('action.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulatoryIntelligenceEnhancedPage;