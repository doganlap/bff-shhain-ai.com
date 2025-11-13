import React, { useState, useEffect } from 'react';
import {
  Building2, Shield, AlertTriangle, Eye, Edit, Trash2, Plus, Search, Filter,
  Users, BarChart3, TrendingUp, Clock, CheckCircle, XCircle, FileText,
  Target, Zap, Settings, Download, RefreshCw
} from 'lucide-react';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner } from '../../components/Animation/InteractiveAnimationToolkit';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';
import { useI18n } from '../../hooks/useI18n';

const VendorsPage = () => {
  const { language, changeLanguage } = useI18n();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [vendorRisks, setVendorRisks] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'technology',
    contact_email: '',
    contact_phone: '',
    website: '',
    country: '',
    risk_level: 'medium',
    status: 'active'
  });

  // Vendor statistics
  const [vendorStats, setVendorStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    highRiskVendors: 0,
    pendingAssessments: 0,
    averageRiskScore: '0.0',
    complianceRate: '0%'
  });

  useEffect(() => {
    loadVendors();
    loadVendorStats();
  }, [searchTerm, filterBy]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await apiService.vendors.getAll({
        search: searchTerm,
        status: filterBy !== 'all' ? filterBy : undefined
      });
      const vendorsData = response.data || response || [];
      setVendors(vendorsData);
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast.error(language === 'ar' ? 'فشل تحميل الموردين' : 'Failed to load vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const loadVendorStats = async () => {
    try {
      const response = await apiService.vendors.getStats();
      if (response?.data) {
        setVendorStats(response.data);
      }
    } catch (error) {
      console.error('Error loading vendor stats:', error);
    }
  };

  const loadVendorRisks = async (vendorId) => {
    try {
      const response = await apiService.vendors.getRisks(vendorId);
      const risksData = response.data || response || [];
      setVendorRisks(risksData);
    } catch (error) {
      console.error('Error loading vendor risks:', error);
      setVendorRisks([]);
    }
  };

  // CRUD Operations
  const handleCreateVendor = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.vendors.create(formData);
      if (response.data?.success || response.success) {
        toast.success(language === 'ar' ? 'تم إنشاء المورد بنجاح!' : 'Vendor created successfully!');
        setShowCreateModal(false);
        resetForm();
        loadVendors();
        loadVendorStats();
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
      toast.error(language === 'ar' ? 'فشل إنشاء المورد' : 'Failed to create vendor');
    }
  };

  const handleUpdateVendor = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.vendors.update(selectedVendor.id, formData);
      if (response.data?.success || response.success) {
        toast.success(language === 'ar' ? 'تم تحديث المورد بنجاح!' : 'Vendor updated successfully!');
        setShowEditModal(false);
        resetForm();
        setSelectedVendor(null);
        loadVendors();
        loadVendorStats();
      }
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast.error(language === 'ar' ? 'فشل تحديث المورد' : 'Failed to update vendor');
    }
  };

  const handleDeleteVendor = async () => {
    try {
      const response = await apiService.vendors.delete(selectedVendor.id);
      if (response.data?.success || response.success) {
        toast.success(language === 'ar' ? 'تم حذف المورد بنجاح!' : 'Vendor deleted successfully!');
        setShowDeleteModal(false);
        setSelectedVendor(null);
        loadVendors();
        loadVendorStats();
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error(language === 'ar' ? 'فشل حذف المورد' : 'Failed to delete vendor');
    }
  };

  const handleAssessVendor = async (vendorId) => {
    try {
      const response = await apiService.vendors.assess(vendorId);
      if (response.data?.success || response.success) {
        toast.success(language === 'ar' ? 'تم تقييم المورد بنجاح!' : 'Vendor assessment completed!');
        loadVendors();
        loadVendorStats();
        if (selectedVendor?.id === vendorId) {
          loadVendorRisks(vendorId);
        }
      }
    } catch (error) {
      console.error('Error assessing vendor:', error);
      toast.error(language === 'ar' ? 'فشل تقييم المورد' : 'Failed to assess vendor');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'technology',
      contact_email: '',
      contact_phone: '',
      website: '',
      country: '',
      risk_level: 'medium',
      status: 'active'
    });
  };

  const openEditModal = (vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      name: vendor.name || '',
      description: vendor.description || '',
      category: vendor.category || 'technology',
      contact_email: vendor.contact_email || '',
      contact_phone: vendor.contact_phone || '',
      website: vendor.website || '',
      country: vendor.country || '',
      risk_level: vendor.risk_level || 'medium',
      status: vendor.status || 'active'
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (vendor) => {
    setSelectedVendor(vendor);
    setShowDeleteModal(true);
  };

  const openAssessmentModal = (vendor) => {
    setSelectedVendor(vendor);
    loadVendorRisks(vendor.id);
    setShowAssessmentModal(true);
  };

  const getRiskLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <CulturalLoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <ArabicTextEngine
            personalityType="professional"
            style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af' }}
          >
            {language === 'ar' ? 'إدارة الموردين' : 'Vendor Management'}
          </ArabicTextEngine>
          <ArabicTextEngine
            personalityType="casual"
            style={{ fontSize: '16px', color: '#6b7280', marginTop: '8px' }}
          >
            {language === 'ar' ? 'إدارة الموردين وتقييم مخاطر الطرف الثالث' : 'Manage vendors and assess third-party risks'}
          </ArabicTextEngine>
        </div>

        <div className="flex gap-3">
          <AnimatedButton
            variant="secondary"
            onClick={() => changeLanguage(language === 'ar' ? 'en' : 'ar')}
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </AnimatedButton>

          <AnimatedButton
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'إضافة مورد جديد' : 'Add New Vendor'}
          </AnimatedButton>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{vendorStats.totalVendors}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'إجمالي الموردين' : 'Total Vendors'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{vendorStats.activeVendors}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'الموردون النشطون' : 'Active Vendors'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{vendorStats.highRiskVendors}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'موردون عالي المخاطر' : 'High Risk Vendors'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{vendorStats.pendingAssessments}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'تقييمات معلقة' : 'Pending Assessments'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Filters and Search */}
      <AnimatedCard hover3D={false} culturalPattern={true}>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'البحث في الموردين...' : 'Search vendors...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
                <option value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                <option value="pending">{language === 'ar' ? 'معلق' : 'Pending'}</option>
              </select>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Vendors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <AnimatedCard key={vendor.id} hover3D={true} culturalPattern={true}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {vendor.name}
                    </h3>
                    <p className="text-sm text-gray-600">{vendor.category}</p>
                  </div>
                </div>
                {getStatusIcon(vendor.status)}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {language === 'ar' ? 'مستوى المخاطر:' : 'Risk Level:'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(vendor.risk_level)}`}>
                    {vendor.risk_level?.toUpperCase()}
                  </span>
                </div>

                {vendor.country && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {language === 'ar' ? 'البلد:' : 'Country:'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{vendor.country}</span>
                  </div>
                )}

                {vendor.contact_email && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}
                    </span>
                    <span className="text-sm font-medium text-gray-900 truncate">{vendor.contact_email}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex space-x-2">
                  <AnimatedButton variant="ghost" size="sm" onClick={() => openAssessmentModal(vendor)}>
                    <Eye className="h-4 w-4" />
                  </AnimatedButton>
                  <AnimatedButton variant="ghost" size="sm" onClick={() => openEditModal(vendor)}>
                    <Edit className="h-4 w-4" />
                  </AnimatedButton>
                  <AnimatedButton variant="ghost" size="sm" onClick={() => openDeleteModal(vendor)}>
                    <Trash2 className="h-4 w-4" />
                  </AnimatedButton>
                </div>
                <AnimatedButton 
                  variant="primary" 
                  size="sm"
                  onClick={() => handleAssessVendor(vendor.id)}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  {language === 'ar' ? 'تقييم' : 'Assess'}
                </AnimatedButton>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {vendors.length === 0 && !loading && (
        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'ar' ? 'لا توجد موردون' : 'No vendors found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {language === 'ar' ? 'ابدأ بإضافة مورد جديد لإدارة مخاطر الطرف الثالث' : 'Start by adding a new vendor to manage third-party risks'}
            </p>
            <AnimatedButton
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'إضافة مورد جديد' : 'Add New Vendor'}
            </AnimatedButton>
          </div>
        </AnimatedCard>
      )}
    </div>
  );
};

export default VendorsPage;
