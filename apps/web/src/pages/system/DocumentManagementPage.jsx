import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Upload, Download, Eye, Edit, Trash2, Plus, Search, Filter, Tag, Calendar,
  Scan, Zap, Brain, Settings, FileImage, FileCheck, Clock, AlertCircle,
  BarChart3, PieChart, TrendingUp, Database, Layers, RefreshCw
} from 'lucide-react';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner, AnimatedProgress } from '../../components/Animation/InteractiveAnimationToolkit';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';

const DocumentManagementPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('documents');
  const [isUploading, setIsUploading] = useState(false);
  const [processingQueue, setProcessingQueue] = useState([]);
  const [ocrEnabled, setOcrEnabled] = useState(true);
  const [autoCategorizationEnabled, setAutoCategorizationEnabled] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Real processing statistics from API
  const [processingStats, setProcessingStats] = useState({
    totalProcessed: 0,
    ocrSuccess: 0,
    autoCategorizationAccuracy: 0,
    averageProcessingTime: '0s',
    textExtracted: '0 words',
    metadataExtracted: '0 fields'
  });

  // Fetch documents and stats from API
  useEffect(() => {
    loadDocuments();
    loadProcessingStats();
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
  }, [searchTerm, filterBy]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiService.documents.getAll({
        search: searchTerm,
        category: filterBy !== 'all' ? filterBy : undefined
      });
      
      if (response?.data?.success && response.data.data) {
        setDocuments(response.data.data);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProcessingStats = async () => {
    try {
      const response = await apiService.documents.getStats();
      if (response?.data?.success && response.data.data) {
        setProcessingStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading processing stats:', error);
    }
  };

  // Upload document to API
  const handleFileUpload = async (files) => {
    try {
      setIsUploading(true);
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('ocrEnabled', ocrEnabled);
        formData.append('autoCategorizationEnabled', autoCategorizationEnabled);

        return apiService.documents.upload(formData);
      });

      await Promise.all(uploadPromises);
      toast.success(`${files.length} document(s) uploaded successfully`);
      loadDocuments();
      loadProcessingStats();
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error('Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete document
  const handleDeleteDocument = async (id) => {
    try {
      await apiService.documents.delete(id);
      toast.success('Document deleted successfully');
      loadDocuments();
      loadProcessingStats();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'إدارة الوثائق' : 'Document Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'تحميل وإدارة وثائق الامتثال مع معالجة ذكية' : 'Upload and manage compliance documents with intelligent processing'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files)}
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.jpg,.png"
          />
          <AnimatedButton
            variant="primary"
            culturalStyle="modern"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? (language === 'ar' ? 'جاري الرفع...' : 'Uploading...') :
                          (language === 'ar' ? 'رفع وثيقة' : 'Upload Document')}
          </AnimatedButton>
        </div>
      </div>

      {/* Processing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedCard hover3D={true} culturalPattern={false}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                {language === 'ar' ? 'المعالجة الإجمالية' : 'Total Processed'}
              </h3>
              <FileCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {processingStats.totalProcessed}
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={true} culturalPattern={false}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                {language === 'ar' ? 'دقة OCR' : 'OCR Accuracy'}
              </h3>
              <Scan className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {processingStats.ocrSuccess}%
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={true} culturalPattern={false}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                {language === 'ar' ? 'النص المستخرج' : 'Text Extracted'}
              </h3>
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {processingStats.textExtracted}
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Documents List */}
      <AnimatedCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'الوثائق' : 'Documents'}
            </h2>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'البحث في الوثائق...' : 'Search documents...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
                <option value="compliance">{language === 'ar' ? 'الامتثال' : 'Compliance'}</option>
                <option value="policy">{language === 'ar' ? 'السياسة' : 'Policy'}</option>
                <option value="report">{language === 'ar' ? 'التقرير' : 'Report'}</option>
                <option value="framework">{language === 'ar' ? 'الإطار' : 'Framework'}</option>
              </select>
            </div>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {language === 'ar' ? 'لا توجد وثائق' : 'No documents found'}
              </p>
              <p className="text-gray-400">
                {language === 'ar' ? 'ابدأ برفع وثيقتك الأولى' : 'Start by uploading your first document'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {language === 'ar' ? doc.nameAr || doc.name : doc.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {doc.format} • {doc.size} • {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(doc.downloadUrl, '_blank')}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => window.open(doc.downloadUrl, '_blank')}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default DocumentManagementPage;
