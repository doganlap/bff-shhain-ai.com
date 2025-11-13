import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';
import { Users, Plus, Eye, Edit, Globe, Building2, Search, Trash2 } from 'lucide-react';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner } from '../../components/Animation/InteractiveAnimationToolkit';
import { FeatureGate, useSubscription } from '../../components/Subscription/SubscriptionManager';

const RegulatorsPage = () => {
  useApp();
  useSubscription();
  const [regulators, setRegulators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
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

  useEffect(() => {
    loadRegulators();
  }, [loadRegulators]);

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
        const response = await apiService.regulators.update(editingRegulator.id, formData);
        if (response.data.success) {
          toast.success('Regulator updated successfully');
        }
      } else {
        const response = await apiService.regulators.create(formData);
        if (response.data.success) {
          toast.success('Regulator created successfully');
        }
      }
      closeModal();
      loadRegulators();
    } catch (error) {
      console.error('Error saving regulator:', error);
      toast.error('Failed to save regulator');
    }
  };

  const handleDelete = async (regulatorId) => {
    if (window.confirm('Are you sure you want to delete this regulator?')) {
      try {
        const response = await apiService.regulators.delete(regulatorId);
        if (response.data.success) {
          toast.success('Regulator deleted successfully');
          loadRegulators();
        }
      } catch (error) {
        console.error('Error deleting regulator:', error);
        toast.error('Failed to delete regulator');
      }
    }
  };

  const loadRegulators = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.regulators.getAll({
        search: searchTerm
      });
      if (response?.data?.success && response.data.data) {
        setRegulators(response.data.data);
      } else {
        setRegulators([]);
      }
    } catch (error) {
      console.error('Error loading regulators:', error);
      toast.error('Failed to load regulators');
      setRegulators([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Language effect
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
  }, []);

  // Filter regulators based on search
  const filteredRegulators = regulators.filter(regulator =>
    regulator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    regulator.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    regulator.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <ArabicTextEngine 
            animated={true}
            personalityType="professional"
            style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a202c', marginBottom: '8px' }}
          >
            {language === 'ar' ? 'الجهات التنظيمية' : 'Regulators'}
          </ArabicTextEngine>
          <ArabicTextEngine 
            personalityType="casual"
            style={{ fontSize: '16px', color: '#4a5568' }}
          >
            {language === 'ar' ? 'إدارة السلطات التنظيمية وأطرها' : 'Manage regulatory authorities and their frameworks'}
          </ArabicTextEngine>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <FeatureGate feature="advancedSearch" fallback={null}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث في الجهات التنظيمية...' : 'Search regulators...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
              />
            </div>
          </FeatureGate>
          
          <FeatureGate feature="dataManagement">
            <AnimatedButton
              variant="primary"
              culturalStyle="modern"
              style={{ backgroundColor: '#667eea' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              <ArabicTextEngine personalityType="casual">
                {language === 'ar' ? 'إضافة جهة تنظيمية' : 'Add Regulator'}
              </ArabicTextEngine>
            </AnimatedButton>
          </FeatureGate>
        </div>
      </div>

      {/* Regulators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRegulators.map((regulator) => (
          <AnimatedCard key={regulator.id} hover3D={true} culturalPattern={true}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <ArabicTextEngine 
                    personalityType="professional"
                    style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '4px' }}
                  >
                    {regulator.name}
                  </ArabicTextEngine>
                  <p className="text-sm text-gray-600">{regulator.code}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  regulator.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  <ArabicTextEngine personalityType="casual" style={{ fontSize: '12px' }}>
                    {regulator.is_active ? 
                      (language === 'ar' ? 'نشط' : 'Active') : 
                      (language === 'ar' ? 'غير نشط' : 'Inactive')}
                  </ArabicTextEngine>
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px' }}>
                    {regulator.jurisdiction}
                  </ArabicTextEngine>
                </div>
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px' }}>
                    {regulator.sector}
                  </ArabicTextEngine>
                </div>
              </div>
              
              <ArabicTextEngine 
                personalityType="casual"
                style={{ fontSize: '14px', color: '#4a5568', marginBottom: '16px', lineHeight: '1.5' }}
              >
                {(regulator.description || '').substring(0, 100)}...
              </ArabicTextEngine>
              
              <div className="flex space-x-2">
                <AnimatedButton
                  variant="outline"
                  size="small"
                  culturalStyle="modern"
                  style={{ flex: 1 }}
                  onClick={() => openModal(regulator)} // Simplified to open edit modal
                >
                  <Eye className="h-4 w-4 mr-1" />
                  <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px' }}>
                    {language === 'ar' ? 'عرض' : 'View'}
                  </ArabicTextEngine>
                </AnimatedButton>
                
                <FeatureGate feature="dataManagement">
                  <AnimatedButton
                    variant="outline"
                    size="small"
                    culturalStyle="modern"
                    style={{ flex: 1 }}
                    onClick={() => openModal(regulator)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px' }}>
                      {language === 'ar' ? 'تحرير' : 'Edit'}
                    </ArabicTextEngine>
                  </AnimatedButton>
                  <AnimatedButton
                    variant="outline"
                    size="small"
                    culturalStyle="modern"
                    style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }}
                    onClick={() => handleDelete(regulator.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px' }}>
                      {language === 'ar' ? 'حذف' : 'Delete'}
                    </ArabicTextEngine>
                  </AnimatedButton>
                </FeatureGate>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Empty State */}
      {filteredRegulators.length === 0 && (
        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <ArabicTextEngine 
              personalityType="friendly"
              style={{ fontSize: '18px', fontWeight: '600', color: '#4a5568', marginBottom: '8px' }}
            >
              {language === 'ar' ? 'لا توجد جهات تنظيمية' : 'No regulators found'}
            </ArabicTextEngine>
            <ArabicTextEngine 
              personalityType="casual"
              style={{ fontSize: '14px', color: '#6b7280' }}
            >
              {language === 'ar' ? 
                (searchTerm ? 'جرب مصطلح بحث مختلف' : 'ابدأ بإضافة جهة تنظيمية جديدة') :
                (searchTerm ? 'Try a different search term' : 'Start by adding a new regulator')}
            </ArabicTextEngine>
          </div>
        </AnimatedCard>
      )}

      {/* Modal for Add/Edit Regulator */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <AnimatedCard className="bg-white rounded-lg shadow-xl w-full max-w-lg" culturalPattern={false}>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{editingRegulator ? 'Edit Regulator' : 'Add Regulator'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">Code</label>
                  <input type="text" name="code" id="code" value={formData.code} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div>
                  <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700">Jurisdiction</label>
                  <input type="text" name="jurisdiction" id="jurisdiction" value={formData.jurisdiction} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div>
                  <label htmlFor="sector" className="block text-sm font-medium text-gray-700">Sector</label>
                  <input type="text" name="sector" id="sector" value={formData.sector} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea name="description" id="description" value={formData.description} onChange={handleInputChange} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" name="is_active" id="is_active" checked={formData.is_active} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Active</label>
                </div>
                <div className="flex justify-end space-x-4">
                  <AnimatedButton type="button" variant="outline" onClick={closeModal}>Cancel</AnimatedButton>
                  <AnimatedButton type="submit" variant="primary">{editingRegulator ? 'Save Changes' : 'Create Regulator'}</AnimatedButton>
                </div>
              </form>
            </div>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
};

export default RegulatorsPage;
