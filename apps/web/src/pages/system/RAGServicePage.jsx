import React, { useState, useEffect } from 'react';
import { Search, FileText, Brain, Upload, Download, MessageSquare, Sparkles, Database, Filter, Settings } from 'lucide-react';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner, AnimatedProgress } from '../../components/Animation/InteractiveAnimationToolkit';
import { PermissionBasedCard, PermissionBasedButton } from '../../components/common/PermissionBasedCard';
import { useRBAC } from '../../hooks/useRBAC';
// import { QuickActionsToolbar } from '../../components/dashboard/QuickActionsToolbar';
// import { RoleDashboardCards } from '../../components/dashboard/RoleDashboardCards';
// import { AdvancedAnalyticsPanel } from '../../components/dashboard/AdvancedAnalyticsPanel';
// import { RealTimeMonitor } from '../../components/dashboard/RealTimeMonitor';

const RAGServicePage = () => {
  const { user, hasPermission } = useRBAC();
  const [language, setLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('query');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [ragMetrics, setRagMetrics] = useState({
    totalDocuments: 0,
    indexedDocuments: 0,
    avgResponseTime: 0,
    queryAccuracy: 0
  });

  // Sample documents for demonstration
  const sampleDocuments = [
    {
      id: 1,
      name: 'SAMA Cybersecurity Framework.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploaded: '2024-01-15',
      status: 'processed',
      chunks: 156,
      embeddings: 156
    },
    {
      id: 2,
      name: 'ISO 27001 Implementation Guide.docx',
      type: 'DOCX',
      size: '1.8 MB',
      uploaded: '2024-01-14',
      status: 'processed',
      chunks: 98,
      embeddings: 98
    },
    {
      id: 3,
      name: 'NCA Compliance Checklist.xlsx',
      type: 'XLSX',
      size: '0.5 MB',
      uploaded: '2024-01-13',
      status: 'processing',
      chunks: 0,
      embeddings: 0
    },
    {
      id: 4,
      name: 'PCI DSS Requirements.pdf',
      type: 'PDF',
      size: '3.2 MB',
      uploaded: '2024-01-12',
      status: 'processed',
      chunks: 203,
      embeddings: 203
    }
  ];

  // Sample search results
  const sampleResults = [
    {
      id: 1,
      document: 'SAMA Cybersecurity Framework.pdf',
      relevance: 0.92,
      chunk: 'Organizations must implement multi-factor authentication for all privileged accounts accessing critical systems. This requirement applies to both internal users and third-party service providers.',
      page: 45,
      section: 'Access Control Requirements',
      context: 'Authentication and Authorization'
    },
    {
      id: 2,
      document: 'ISO 27001 Implementation Guide.docx',
      relevance: 0.87,
      chunk: 'Access control procedures should be documented and regularly reviewed. Organizations must maintain an inventory of all user accounts and their associated privileges.',
      page: 23,
      section: 'A.9.1 Access Control Management',
      context: 'User Access Management'
    },
    {
      id: 3,
      document: 'PCI DSS Requirements.pdf',
      relevance: 0.83,
      chunk: 'Strong authentication mechanisms must be implemented for all system components. Default passwords and authentication parameters must be changed before systems are put into production.',
      page: 67,
      section: 'Requirement 8: Authentication',
      context: 'Identity and Access Management'
    }
  ];

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
    setDocuments(sampleDocuments);
  }, []);

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSearchResults(sampleResults);
    } catch (error) {
      console.error('RAG query failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelevanceColor = (score) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.8) return 'text-blue-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

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
            {language === 'ar' ? 'خدمة الذكاء الاصطناعي للمستندات' : 'RAG Service - Document AI'}
          </ArabicTextEngine>
          <ArabicTextEngine
            personalityType="casual"
            style={{ fontSize: '16px', color: '#4a5568' }}
          >
            {language === 'ar' ? 'البحث الذكي والتحليل المعزز للوثائق' : 'Intelligent document search and retrieval-augmented generation'}
          </ArabicTextEngine>
        </div>

        <div className="flex items-center space-x-2">
          <AnimatedButton
            variant="outline"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </AnimatedButton>
          <AnimatedButton variant="primary" onClick={() => setActiveTab('settings')}>
            <Settings className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'الإعدادات' : 'Settings'}
          </AnimatedButton>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'المستندات المعالجة' : 'Processed Documents'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">657</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'القطع النصية' : 'Text Chunks'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">657</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'التضمينات المتجهة' : 'Vector Embeddings'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Sparkles className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">1,234</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'الاستعلامات المنجزة' : 'Queries Processed'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {[
            { id: 'query', name: language === 'ar' ? 'البحث الذكي' : 'Smart Query', icon: Search },
            { id: 'documents', name: language === 'ar' ? 'إدارة المستندات' : 'Document Management', icon: FileText },
            { id: 'analytics', name: language === 'ar' ? 'التحليلات' : 'Analytics', icon: Brain },
            { id: 'settings', name: language === 'ar' ? 'الإعدادات' : 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Smart Query Tab */}
        {activeTab === 'query' && (
          <div className="space-y-6">
            {/* Query Interface */}
            <AnimatedCard hover3D={false} culturalPattern={true}>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ArabicTextEngine personalityType="casual">
                        {language === 'ar' ? 'اسأل عن أي شيء في مستنداتك' : 'Ask anything about your documents'}
                      </ArabicTextEngine>
                    </label>
                    <div className="relative">
                      <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={language === 'ar' ? 'مثال: ما هي متطلبات المصادقة متعددة العوامل؟' : 'e.g., What are the multi-factor authentication requirements?'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                      />
                      <AnimatedButton
                        variant="primary"
                        onClick={handleQuery}
                        disabled={loading || !query.trim()}
                        className="absolute bottom-3 right-3"
                      >
                        {loading ? (
                          <CulturalLoadingSpinner culturalStyle="modern" size="small" />
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            {language === 'ar' ? 'بحث' : 'Search'}
                          </>
                        )}
                      </AnimatedButton>
                    </div>
                  </div>

                  {/* Quick Questions */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'أسئلة سريعة:' : 'Quick questions:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        language === 'ar' ? 'ما هي متطلبات الأمان؟' : 'What are the security requirements?',
                        language === 'ar' ? 'كيفية تنفيذ الضوابط؟' : 'How to implement controls?',
                        language === 'ar' ? 'متطلبات الامتثال' : 'Compliance requirements',
                        language === 'ar' ? 'إجراءات التدقيق' : 'Audit procedures'
                      ].map((quickQuery, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(quickQuery)}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                        >
                          {quickQuery}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  <ArabicTextEngine personalityType="professional">
                    {language === 'ar' ? 'النتائج ذات الصلة' : 'Relevant Results'}
                  </ArabicTextEngine>
                </h3>

                {searchResults.map((result) => (
                  <AnimatedCard key={result.id} hover3D={false} culturalPattern={true}>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">{result.document}</span>
                            <span className="text-xs text-gray-500">
                              {language === 'ar' ? 'صفحة' : 'Page'} {result.page}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{result.section}</p>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-sm font-semibold ${getRelevanceColor(result.relevance)}`}>
                            {Math.round(result.relevance * 100)}% {language === 'ar' ? 'صلة' : 'relevance'}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-gray-800 leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          "{result.chunk}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {language === 'ar' ? 'السياق:' : 'Context:'} {result.context}
                        </span>
                        <div className="flex space-x-2">
                          <button className="text-xs text-blue-600 hover:text-blue-800">
                            {language === 'ar' ? 'عرض المستند' : 'View Document'}
                          </button>
                          <button className="text-xs text-green-600 hover:text-green-800">
                            {language === 'ar' ? 'حفظ النتيجة' : 'Save Result'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Document Management Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Upload Area */}
            <AnimatedCard hover3D={false} culturalPattern={true}>
              <div className="p-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    <ArabicTextEngine personalityType="casual">
                      {language === 'ar' ? 'رفع المستندات للمعالجة' : 'Upload Documents for Processing'}
                    </ArabicTextEngine>
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {language === 'ar' ? 'يدعم PDF, DOCX, TXT, والمزيد' : 'Supports PDF, DOCX, TXT, and more'}
                  </p>
                  <AnimatedButton variant="primary">
                    <Upload className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'اختر الملفات' : 'Choose Files'}
                  </AnimatedButton>
                </div>
              </div>
            </AnimatedCard>

            {/* Documents List */}
            <AnimatedCard hover3D={false} culturalPattern={true}>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <ArabicTextEngine personalityType="professional">
                    {language === 'ar' ? 'المستندات المعالجة' : 'Processed Documents'}
                  </ArabicTextEngine>
                </h3>

                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-600">
                            {doc.size} • {language === 'ar' ? 'رُفع في' : 'Uploaded'} {doc.uploaded}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {doc.chunks} {language === 'ar' ? 'قطعة' : 'chunks'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {doc.embeddings} {language === 'ar' ? 'تضمين' : 'embeddings'}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Download className="w-4 h-4" />
                        </button>
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
          <div className="space-y-6">
            <AnimatedCard hover3D={false} culturalPattern={true}>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <ArabicTextEngine personalityType="professional">
                    {language === 'ar' ? 'إحصائيات الاستخدام' : 'Usage Analytics'}
                  </ArabicTextEngine>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الاستعلامات هذا الشهر' : 'Queries This Month'}
                    </h4>
                    <AnimatedProgress value={75} max={100} className="h-3 mb-2" />
                    <p className="text-sm text-gray-600">1,234 / 1,500 queries used</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'دقة النتائج' : 'Result Accuracy'}
                    </h4>
                    <AnimatedProgress value={92} max={100} className="h-3 mb-2" />
                    <p className="text-sm text-gray-600">92% average relevance score</p>
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
                  <ArabicTextEngine personalityType="professional">
                    {language === 'ar' ? 'إعدادات RAG' : 'RAG Settings'}
                  </ArabicTextEngine>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'نموذج الذكاء الاصطناعي' : 'AI Model'}
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option>GPT-4</option>
                      <option>Claude-3</option>
                      <option>Gemini Pro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'عدد النتائج' : 'Number of Results'}
                    </label>
                    <input
                      type="number"
                      defaultValue={5}
                      min={1}
                      max={20}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'درجة الصلة الدنيا' : 'Minimum Relevance Score'}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      defaultValue="0.7"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default RAGServicePage;
