import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/apiEndpoints';
import { Building2, Search, Plus, Eye, Edit, Users, BarChart3, Filter, Shield, AlertTriangle, MapPin, Globe, Trash2, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner, AnimatedProgress } from '../../components/Animation/InteractiveAnimationToolkit';
import { FeatureGate, useSubscription } from '../../components/Subscription/SubscriptionManager';
import { toast } from 'sonner';
import { useI18n } from '../../hooks/useI18n';

const OrganizationsPage = () => {
  const { state } = useApp();
  const { hasFeature, currentPlan } = useSubscription();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnitsModal, setShowUnitsModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [organizationUnits, setOrganizationUnits] = useState([]);
  const [expandedOrgs, setExpandedOrgs] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    country: '',
    website: '',
    contact_email: '',
    risk_level: 'medium',
    is_active: true
  });
  const { language, changeLanguage } = useI18n();

  // Fetch real organizations data from API
  useEffect(() => {
    fetchOrganizations();
  }, [searchTerm, filterBy]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await apiService.organizations.getAll({
        search: searchTerm,
        filter: filterBy !== 'all' ? filterBy : undefined
      });
      const orgsData = response.data || response || [];
      setOrganizations(orgsData);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error(language === 'ar' ? 'فشل تحميل المؤسسات' : 'Failed to load organizations');
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations
  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.organizations.create(formData);
      if (response.data?.success || response.success) {
        toast.success(language === 'ar' ? 'تم إنشاء المؤسسة بنجاح!' : 'Organization created successfully!');
        setShowAddModal(false);
        resetForm();
        fetchOrganizations();
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error(language === 'ar' ? 'فشل إنشاء المؤسسة' : 'Failed to create organization');
    }
  };

  const handleUpdateOrganization = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.organizations.update(selectedOrganization.id, formData);
      if (response.data?.success || response.success) {
        toast.success(language === 'ar' ? 'تم تحديث المؤسسة بنجاح!' : 'Organization updated successfully!');
        setShowEditModal(false);
        resetForm();
        setSelectedOrganization(null);
        fetchOrganizations();
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error(language === 'ar' ? 'فشل تحديث المؤسسة' : 'Failed to update organization');
    }
  };

  const handleDeleteOrganization = async () => {
    try {
      const response = await apiService.organizations.delete(selectedOrganization.id);
      if (response.data?.success || response.success) {
        toast.success(language === 'ar' ? 'تم حذف المؤسسة بنجاح!' : 'Organization deleted successfully!');
        setShowDeleteModal(false);
        setSelectedOrganization(null);
        fetchOrganizations();
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error(language === 'ar' ? 'فشل حذف المؤسسة' : 'Failed to delete organization');
    }
  };

  const loadOrganizationUnits = async (orgId) => {
    try {
      const response = await apiService.organizations.getUnits(orgId);
      const unitsData = response.data || response || [];
      setOrganizationUnits(unitsData);
    } catch (error) {
      console.error('Error loading organization units:', error);
      setOrganizationUnits([]);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      industry: '',
      country: '',
      website: '',
      contact_email: '',
      risk_level: 'medium',
      is_active: true
    });
  };

  const openEditModal = (organization) => {
    setSelectedOrganization(organization);
    setFormData({
      name: organization.name || '',
      description: organization.description || '',
      industry: organization.industry || '',
      country: organization.country || '',
      website: organization.website || '',
      contact_email: organization.contact_email || '',
      risk_level: organization.risk_level || 'medium',
      is_active: organization.is_active !== false
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (organization) => {
    setSelectedOrganization(organization);
    setShowDeleteModal(true);
  };

  const openUnitsModal = (organization) => {
    setSelectedOrganization(organization);
    loadOrganizationUnits(organization.id);
    setShowUnitsModal(true);
  };

  const toggleOrganizationExpansion = (orgId) => {
    const newExpanded = new Set(expandedOrgs);
    if (expandedOrgs.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
    }
    setExpandedOrgs(newExpanded);
  };

  // Filter organizations
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' ||
                         (filterBy === 'high-risk' && org.risk_level === 'high') ||
                         (filterBy === 'medium-risk' && org.risk_level === 'medium') ||
                         (filterBy === 'low-risk' && org.risk_level === 'low') ||
                         (filterBy === 'active' && org.is_active) ||
                         (filterBy === 'inactive' && !org.is_active);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CulturalLoadingSpinner culturalStyle="modern" />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: language === 'ar' ? 'Amiri, Noto Sans Arabic, sans-serif' : 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <ArabicTextEngine
            animated={true}
            personalityType="professional"
            style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a202c', marginBottom: '8px' }}
          >
            {language === 'ar' ? 'المؤسسات' : 'Organizations'}
          </ArabicTextEngine>
          <ArabicTextEngine
            personalityType="casual"
            style={{ fontSize: '16px', color: '#4a5568' }}
          >
            {language === 'ar' ? 'إدارة المؤسسات وحالة الامتثال الخاصة بها' : 'Manage organizations and their compliance status'}
          </ArabicTextEngine>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <FeatureGate feature="advancedSearch" fallback={null}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث في المؤسسات...' : 'Search organizations...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
              />
            </div>
          </FeatureGate>

          {/* Filter */}
          <FeatureGate feature="advancedFilters" fallback={null}>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
              <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
              <option value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</option>
              <option value="high-risk">{language === 'ar' ? 'مخاطر عالية' : 'High Risk'}</option>
              <option value="medium-risk">{language === 'ar' ? 'مخاطر متوسطة' : 'Medium Risk'}</option>
              <option value="low-risk">{language === 'ar' ? 'مخاطر منخفضة' : 'Low Risk'}</option>
            </select>
          </FeatureGate>

          {/* Add Organization */}
          <FeatureGate feature="dataManagement">
            <AnimatedButton
              variant="primary"
              culturalStyle="modern"
              style={{ backgroundColor: '#667eea' }}
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              <ArabicTextEngine personalityType="casual">
                {language === 'ar' ? 'إضافة مؤسسة' : 'Add Organization'}
              </ArabicTextEngine>
            </AnimatedButton>
          </FeatureGate>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid gap-6">
        {filteredOrganizations.map((org) => (
          <AnimatedCard key={org.id} hover3D={true} culturalPattern={true}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <ArabicTextEngine
                      personalityType="professional"
                      style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c' }}
                    >
                      {language === 'ar' ? org.nameAr : org.name}
                    </ArabicTextEngine>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      org.risk_level === 'low' ? 'bg-green-100 text-green-800' :
                      org.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {org.risk_level === 'low' ? (language === 'ar' ? 'مخاطر منخفضة' : 'Low Risk') :
                       org.risk_level === 'medium' ? (language === 'ar' ? 'مخاطر متوسطة' : 'Medium Risk') :
                       (language === 'ar' ? 'مخاطر عالية' : 'High Risk')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <ArabicTextEngine personalityType="casual">
                        {language === 'ar' ? org.industryAr : org.industry}
                      </ArabicTextEngine>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <ArabicTextEngine personalityType="casual">
                        {language === 'ar' ? org.countryAr : org.country}
                      </ArabicTextEngine>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{org.employees?.toLocaleString()} {language === 'ar' ? 'موظف' : 'employees'}</span>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px', color: '#6b7280' }}>
                          {language === 'ar' ? 'التقييمات' : 'Assessments'}
                        </ArabicTextEngine>
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{org.assessment_count}</div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px', color: '#6b7280' }}>
                          {language === 'ar' ? 'نقاط الامتثال' : 'Compliance Score'}
                        </ArabicTextEngine>
                        <Shield className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{org.compliance_score}%</div>
                      <AnimatedProgress
                        value={org.compliance_score}
                        culturalStyle="modern"
                        style={{ height: '6px', marginTop: '8px' }}
                      />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px', color: '#6b7280' }}>
                          {language === 'ar' ? 'الحالة' : 'Status'}
                        </ArabicTextEngine>
                        {org.is_active ?
                          <Shield className="h-4 w-4 text-green-600" /> :
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        }
                      </div>
                      <ArabicTextEngine
                        personalityType="casual"
                        style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: org.is_active ? '#059669' : '#dc2626'
                        }}
                      >
                        {org.is_active ?
                          (language === 'ar' ? 'نشط' : 'Active') :
                          (language === 'ar' ? 'غير نشط' : 'Inactive')
                        }
                      </ArabicTextEngine>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <AnimatedButton
                  variant="outline"
                  size="small"
                  culturalStyle="modern"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px' }}>
                    {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                  </ArabicTextEngine>
                </AnimatedButton>

                <FeatureGate feature="basicAssessments">
                  <AnimatedButton
                    variant="primary"
                    size="small"
                    culturalStyle="modern"
                    style={{ backgroundColor: '#48bb78' }}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px' }}>
                      {language === 'ar' ? 'بدء التقييم' : 'Start Assessment'}
                    </ArabicTextEngine>
                  </AnimatedButton>
                </FeatureGate>

                <FeatureGate feature="dataManagement">
                  <AnimatedButton
                    variant="outline"
                    size="small"
                    culturalStyle="modern"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px' }}>
                      {language === 'ar' ? 'تحرير' : 'Edit'}
                    </ArabicTextEngine>
                  </AnimatedButton>
                </FeatureGate>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrganizations.length === 0 && (
        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <ArabicTextEngine
              personalityType="friendly"
              style={{ fontSize: '18px', fontWeight: '600', color: '#4a5568', marginBottom: '8px' }}
            >
              {language === 'ar' ? 'لا توجد مؤسسات' : 'No organizations found'}
            </ArabicTextEngine>
            <ArabicTextEngine
              personalityType="casual"
              style={{ fontSize: '14px', color: '#6b7280' }}
            >
              {language === 'ar' ?
                (searchTerm ? 'جرب مصطلح بحث مختلف' : 'ابدأ بإضافة مؤسسة جديدة') :
                (searchTerm ? 'Try a different search term' : 'Start by adding a new organization')}
            </ArabicTextEngine>
          </div>
        </AnimatedCard>
      )}
    </div>
  );
};

export default OrganizationsPage;
