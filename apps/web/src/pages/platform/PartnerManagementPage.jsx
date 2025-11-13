import React, { useState, useEffect } from 'react';
import {
  Users, Building2, Mail, Phone, Globe, MapPin, UserPlus, Star, Clock,
  Settings, Filter, Search, Edit, Eye, Trash2, Plus, ArrowRight, Shield,
  CheckCircle, XCircle, AlertTriangle, Activity, Calendar, BarChart3,
  FileText, MessageCircle, Link, Network, Target, UserCheck, TrendingUp
} from 'lucide-react';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner, AnimatedProgress } from '../../components/Animation/InteractiveAnimationToolkit';
import { PermissionBasedCard } from '../../components/common/PermissionBasedCard';
import { useRBAC } from '../../hooks/useRBAC';
import apiService from '../../services/apiEndpoints';
import { useI18n } from '../../hooks/useI18n';

const PartnerManagementPage = () => {
  const { t, language, changeLanguage, isRTL } = useI18n();
  const { hasPermission, userRole } = useRBAC();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('partners');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Partner statistics
  const [partnerStats, setPartnerStats] = useState({
    totalPartners: 34,
    activePartners: 28,
    pendingInvitations: 6,
    avgCollaborationScore: 4.2,
    monthlyInteractions: 156,
    successfulProjects: 89
  });

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    setLoading(true);
    try {
      // Load partners data from API
      const [partnersResponse, analyticsResponse] = await Promise.all([
        apiService.partners.getAll({
          page: 1,
          limit: 50,
          search: searchTerm,
          status: filterBy !== 'all' ? filterBy : undefined
        }),
        apiService.partners.getAnalytics()
      ]);

      setPartners(partnersResponse.data?.data || partnersResponse.data || []);

      if (analyticsResponse.success) {
        setPartnerStats({
          totalPartners: analyticsResponse.data.totalPartners || 0,
          activePartners: analyticsResponse.data.activePartners || 0,
          pendingInvitations: analyticsResponse.data.pendingInvitations || 0,
          avgCollaborationScore: analyticsResponse.data.avgCollaborationScore || 0,
          monthlyInteractions: analyticsResponse.data.monthlyInteractions || 0,
          successfulProjects: analyticsResponse.data.successfulProjects || 0
        });
      }
    } catch (error) {
      console.error('Error loading partners:', error);
      // Set empty data instead of mock data
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };


  const partnerTypes = [
    { value: 'financial_institution', label: 'Financial Institution', labelAr: 'مؤسسة مالية' },
    { value: 'consulting_firm', label: 'Consulting Firm', labelAr: 'شركة استشارات' },
    { value: 'technology_provider', label: 'Technology Provider', labelAr: 'مزود تكنولوجيا' },
    { value: 'regulatory_body', label: 'Regulatory Body', labelAr: 'جهة تنظيمية' },
    { value: 'audit_firm', label: 'Audit Firm', labelAr: 'شركة مراجعة' }
  ];

  const handleInvitePartner = async (inviteData) => {
    try {
      await apiServices.partners.invite(inviteData);
      await loadPartners();
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error inviting partner:', error);
    }
  };

  const handleStatusChange = async (partnerId, newStatus) => {
    try {
      await apiServices.partners.update(partnerId, { status: newStatus });
      await loadPartners();
    } catch (error) {
      console.error('Error updating partner status:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'inactive': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'suspended': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const filteredPartners = partners.filter(partner => {
    const matchesFilter = filterBy === 'all' || partner.status === filterBy;
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          partner.nameAr.includes(searchTerm) ||
                          partner.industry.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const tabs = [
    { id: 'partners', name: 'الشركاء', nameEn: 'Partners', icon: Users },
    { id: 'collaborations', name: 'التعاون', nameEn: 'Collaborations', icon: UserCheck },
    { id: 'analytics', name: 'التحليلات', nameEn: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'الإعدادات', nameEn: 'Settings', icon: Settings }
  ];

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
            {language === 'ar' ? 'إدارة الشركاء' : 'Partner Management'}
          </ArabicTextEngine>
          <ArabicTextEngine
            personalityType="casual"
            style={{ fontSize: '16px', color: '#6b7280', marginTop: '8px' }}
          >
            {language === 'ar' ? 'إدارة الشراكات والتعاون مع الأطراف الثالثة' : 'Manage partnerships and third-party collaborations'}
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
            onClick={() => setShowInviteModal(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'دعوة شريك جديد' : 'Invite New Partner'}
          </AnimatedButton>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PermissionBasedCard
          requiredPermission="partners.view_analytics"
          variant="minimal"
          className="p-6"
          icon={<Building2 className="h-6 w-6 text-blue-600" />}
          iconBg="bg-blue-100"
          title={language === 'ar' ? 'إجمالي الشركاء' : 'Total Partners'}
          value={partnerStats.totalPartners}
          isDark={false}
        />

        <PermissionBasedCard
          requiredPermission="partners.view_analytics"
          variant="minimal"
          className="p-6"
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          iconBg="bg-green-100"
          title={language === 'ar' ? 'الشركاء النشطين' : 'Active Partners'}
          value={partnerStats.activePartners}
          isDark={false}
        />

        <PermissionBasedCard
          requiredPermission="partners.view_analytics"
          variant="minimal"
          className="p-6"
          icon={<Star className="h-6 w-6 text-purple-600" />}
          iconBg="bg-purple-100"
          title={language === 'ar' ? 'متوسط تقييم التعاون' : 'Avg Collaboration Score'}
          value={partnerStats.avgCollaborationScore}
          isDark={false}
        />

        <PermissionBasedCard
          requiredPermission="partners.view_analytics"
          variant="minimal"
          className="p-6"
          icon={<TrendingUp className="h-6 w-6 text-yellow-600" />}
          iconBg="bg-yellow-100"
          title={language === 'ar' ? 'التفاعلات الشهرية' : 'Monthly Interactions'}
          value={partnerStats.monthlyInteractions}
          isDark={false}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              {language === 'ar' ? tab.name : tab.nameEn}
            </span>
          </button>
        ))}
      </div>

      {/* Partners Tab */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <AnimatedCard hover3D={false} culturalPattern={true}>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={language === 'ar' ? 'البحث في الشركاء...' : 'Search partners...'}
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
                    <option value="pending">{language === 'ar' ? 'معلق' : 'Pending'}</option>
                    <option value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                  </select>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Partners List */}
          <div className="space-y-4">
            {filteredPartners.map((partner) => (
              <AnimatedCard key={partner.id} hover3D={true} culturalPattern={true}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-white" />
                      </div>

                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(partner.status)}
                          <h3 className="text-lg font-semibold text-gray-900">
                            {language === 'ar' ? partner.nameAr : partner.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(partner.status)}`}>
                            {partner.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span>{partner.industry}</span>
                          <span>•</span>
                          <span>{partner.location}</span>
                          <span>•</span>
                          <span>{language === 'ar' ? 'انضم في' : 'Joined'} {new Date(partner.establishedDate).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {getRatingStars(partner.rating)}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{partner.rating}</span>
                          <span className="text-sm text-gray-500">({partner.projectsCompleted} {language === 'ar' ? 'مشروع مكتمل' : 'projects completed'})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <AnimatedButton variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </AnimatedButton>
                      <AnimatedButton variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </AnimatedButton>
                      <AnimatedButton variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </AnimatedButton>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">{partner.email}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{partner.phone}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a href={partner.website} className="text-sm text-blue-600 hover:underline truncate">
                        {partner.website.replace('https://', '')}
                      </a>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      {language === 'ar' ? 'الخدمات' : 'Services'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {partner.services.map((service, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recent Projects */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      {language === 'ar' ? 'المشاريع الحديثة' : 'Recent Projects'}
                    </h4>
                    <div className="space-y-2">
                      {partner.recentProjects.slice(0, 2).map((project, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              project.status === 'completed' ? 'bg-green-500' :
                              project.status === 'in-progress' ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`}></div>
                            <span className="text-sm text-gray-700">{project.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{project.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Persons */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      {language === 'ar' ? 'جهات الاتصال' : 'Contacts'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {partner.contacts.map((contact, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                            <p className="text-xs text-gray-500">{contact.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      )}

      {/* Collaborations Tab */}
      {activeTab === 'collaborations' && (
        <div className="space-y-4">
          <AnimatedCard hover3D={false} culturalPattern={true}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'ar' ? 'مشاريع التعاون النشطة' : 'Active Collaboration Projects'}
              </h3>

              <div className="space-y-4">
                {[
                  { name: 'Basel III Compliance Framework', partner: 'Saudi Arabian Bank Solutions', status: 'in-progress', progress: 75 },
                  { name: 'Risk Management System Integration', partner: 'Gulf Regulatory Advisors', status: 'in-progress', progress: 45 },
                  { name: 'Security Assessment Project', partner: 'TechSec Middle East', status: 'planning', progress: 15 }
                ].map((project, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {project.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {language === 'ar' ? 'بالتعاون مع:' : 'In collaboration with:'} {project.partner}
                    </p>

                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">{language === 'ar' ? 'التقدم' : 'Progress'}</span>
                        <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                      </div>
                      <AnimatedProgress value={project.progress} max={100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatedCard hover3D={false} culturalPattern={true}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'ar' ? 'توزيع أنواع الشركاء' : 'Partner Type Distribution'}
              </h3>
              <div className="space-y-3">
                {[
                  { type: 'Financial Institutions', count: 12, color: 'bg-blue-500' },
                  { type: 'Consulting Firms', count: 8, color: 'bg-green-500' },
                  { type: 'Technology Providers', count: 6, color: 'bg-yellow-500' },
                  { type: 'Regulatory Bodies', count: 4, color: 'bg-purple-500' },
                  { type: 'Audit Firms', count: 4, color: 'bg-red-500' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${item.color} rounded mr-2`}></div>
                      <span className="text-sm text-gray-700">{item.type}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard hover3D={false} culturalPattern={true}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'ar' ? 'تقييمات الشراكة' : 'Partnership Ratings'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ar' ? 'ممتاز (5 نجوم)' : 'Excellent (5 stars)'}</span>
                  <span className="text-sm font-medium">18</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ar' ? 'جيد جداً (4 نجوم)' : 'Very Good (4 stars)'}</span>
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{language === 'ar' ? 'جيد (3 نجوم)' : 'Good (3 stars)'}</span>
                  <span className="text-sm font-medium">4</span>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <AnimatedCard hover3D={false} culturalPattern={true}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'ar' ? 'إعدادات الشراكة' : 'Partnership Settings'}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {language === 'ar' ? 'الموافقة التلقائية على الشراكات' : 'Auto-approve partnerships'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {language === 'ar' ? 'الموافقة تلقائياً على طلبات الشراكة من الجهات المعتمدة' : 'Automatically approve partnership requests from verified entities'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'الحد الأدنى لتقييم الشريك' : 'Minimum Partner Rating'}
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                    <option>3.0</option>
                    <option>3.5</option>
                    <option>4.0</option>
                    <option>4.5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'مدة صلاحية الشراكة (أشهر)' : 'Partnership Validity Period (months)'}
                  </label>
                  <input
                    type="number"
                    defaultValue={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
};

export default PartnerManagementPage;
