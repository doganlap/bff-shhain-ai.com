import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Search, FileText, Brain, Zap, Database,
  RefreshCw, Settings, BarChart3, Eye, Clock,
  CheckCircle, AlertTriangle
} from 'lucide-react';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner } from '../../components/Animation/InteractiveAnimationToolkit';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';
import { useI18n } from '../../hooks/useI18n';

const RAGServicePage = () => {
  const { language, changeLanguage } = useI18n();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queryText, setQueryText] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [activeTab, setActiveTab] = useState('query');

  // RAG Service statistics
  const [ragStats, setRagStats] = useState({
    totalQueries: 0,
    successfulQueries: 0,
    avgResponseTime: '0ms',
    documentsIndexed: 0,
    knowledgeBaseSize: '0 MB',
    accuracyScore: '0%',
    lastIndexUpdate: 'Never',
    activeConnections: 0
  });

  // Query history
  const [queryHistory, setQueryHistory] = useState([]);

  useEffect(() => {
    loadRAGStats();
    loadQueryHistory();
    loadIndexedDocuments();
  }, []);

  const loadRAGStats = async () => {
    try {
      const response = await apiService.rag.getStats();
      if (response?.data) {
        setRagStats(response.data);
      }
    } catch (error) {
      console.error('Error loading RAG stats:', error);
    }
  };

  const loadQueryHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.rag.getQueries();
      const queriesData = response.data || response || [];
      setQueryHistory(queriesData);
    } catch (error) {
      console.error('Error loading query history:', error);
      setQueryHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const loadIndexedDocuments = async () => {
    try {
      const response = await apiService.rag.getDocuments();
      const docsData = response.data || response || [];
      setDocuments(docsData);
    } catch (error) {
      console.error('Error loading indexed documents:', error);
      setDocuments([]);
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    try {
      setIsQuerying(true);
      const response = await apiService.rag.query({
        question: queryText,
        context: 'grc_compliance'
      });
      
      if (response?.data) {
        setQueryResult(response.data);
        toast.success(language === 'ar' ? 'تم تنفيذ الاستعلام بنجاح!' : 'Query executed successfully!');
        loadQueryHistory();
        loadRAGStats();
      }
    } catch (error) {
      console.error('Error executing query:', error);
      toast.error(language === 'ar' ? 'فشل تنفيذ الاستعلام' : 'Failed to execute query');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleReindexDocuments = async () => {
    try {
      const response = await apiService.rag.reindex();
      if (response?.data?.success || response.success) {
        toast.success(language === 'ar' ? 'تم إعادة فهرسة الوثائق!' : 'Documents reindexed successfully!');
        loadRAGStats();
        loadIndexedDocuments();
      }
    } catch (error) {
      console.error('Error reindexing documents:', error);
      toast.error(language === 'ar' ? 'فشل إعادة فهرسة الوثائق' : 'Failed to reindex documents');
    }
  };

  const getQueryStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAccuracyColor = (accuracy) => {
    const score = parseFloat(accuracy);
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const tabs = [
    { id: 'query', name: 'الاستعلام', nameEn: 'Query', icon: MessageSquare },
    { id: 'documents', name: 'الوثائق', nameEn: 'Documents', icon: FileText },
    { id: 'history', name: 'التاريخ', nameEn: 'History', icon: BarChart3 },
    { id: 'settings', name: 'الإعدادات', nameEn: 'Settings', icon: Settings }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <ArabicTextEngine
            personalityType="professional"
            style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af' }}
          >
            {language === 'ar' ? 'خدمة الاسترجاع المعزز بالذكاء الاصطناعي' : 'RAG Service Console'}
          </ArabicTextEngine>
          <ArabicTextEngine
            personalityType="casual"
            style={{ fontSize: '16px', color: '#6b7280', marginTop: '8px' }}
          >
            {language === 'ar' ? 'استعلام ذكي عن المحتوى والوثائق المفهرسة' : 'Intelligent querying of indexed content and documents'}
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
            onClick={handleReindexDocuments}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'إعادة فهرسة' : 'Reindex'}
          </AnimatedButton>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{ragStats.totalQueries}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'إجمالي الاستعلامات' : 'Total Queries'}
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
                <p className="text-2xl font-bold text-gray-900">{ragStats.documentsIndexed}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'وثائق مفهرسة' : 'Documents Indexed'}
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
                <p className={`text-2xl font-bold ${getAccuracyColor(ragStats.accuracyScore)}`}>
                  {ragStats.accuracyScore}
                </p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'نقاط الدقة' : 'Accuracy Score'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard hover3D={false} culturalPattern={true}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{ragStats.avgResponseTime}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'متوسط وقت الاستجابة' : 'Avg Response Time'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>
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

      {/* Query Tab */}
      {activeTab === 'query' && (
        <div className="space-y-6">
          {/* Query Interface */}
          <AnimatedCard hover3D={false} culturalPattern={true}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'ar' ? 'استعلام ذكي' : 'Intelligent Query'}
              </h3>
              <form onSubmit={handleQuery} className="space-y-4">
                <div>
                  <textarea
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder={language === 'ar' ? 'اطرح سؤالك حول الامتثال والحوكمة...' : 'Ask your question about compliance and governance...'}
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={isQuerying}
                  />
                </div>
                <div className="flex justify-end">
                  <AnimatedButton
                    type="submit"
                    variant="primary"
                    disabled={isQuerying || !queryText.trim()}
                  >
                    {isQuerying ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    {isQuerying 
                      ? (language === 'ar' ? 'جاري البحث...' : 'Searching...') 
                      : (language === 'ar' ? 'بحث' : 'Search')
                    }
                  </AnimatedButton>
                </div>
              </form>
            </div>
          </AnimatedCard>

          {/* Query Result */}
          {queryResult && (
            <AnimatedCard hover3D={false} culturalPattern={true}>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ar' ? 'نتيجة الاستعلام' : 'Query Result'}
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-800">{queryResult.answer}</p>
                  </div>
                  
                  {queryResult.sources && queryResult.sources.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {language === 'ar' ? 'المصادر:' : 'Sources:'}
                      </h4>
                      <div className="space-y-2">
                        {queryResult.sources.map((source, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span>{source.title || source.filename}</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {Math.round(source.relevance * 100)}% {language === 'ar' ? 'صلة' : 'relevance'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {language === 'ar' ? 'وقت الاستجابة:' : 'Response time:'} {queryResult.responseTime || '0ms'}
                    </span>
                    <span>
                      {language === 'ar' ? 'نقاط الثقة:' : 'Confidence:'} {Math.round((queryResult.confidence || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'ar' ? 'الوثائق المفهرسة' : 'Indexed Documents'}
            </h3>
            <div className="text-sm text-gray-600">
              {language === 'ar' ? 'حجم قاعدة المعرفة:' : 'Knowledge base size:'} {ragStats.knowledgeBaseSize}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <AnimatedCard key={doc.id} hover3D={true} culturalPattern={true}>
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900 truncate">{doc.title || doc.filename}</h4>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>{language === 'ar' ? 'النوع:' : 'Type:'}</span>
                      <span>{doc.type || 'Document'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'ar' ? 'الحجم:' : 'Size:'}</span>
                      <span>{doc.size || '0 KB'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'ar' ? 'مفهرس:' : 'Indexed:'}</span>
                      <span>{doc.indexedAt || 'Unknown'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doc.status === 'indexed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.status === 'indexed' 
                        ? (language === 'ar' ? 'مفهرس' : 'Indexed')
                        : (language === 'ar' ? 'معلق' : 'Pending')
                      }
                    </span>
                    <AnimatedButton variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </AnimatedButton>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>

          {documents.length === 0 && !loading && (
            <AnimatedCard hover3D={false} culturalPattern={true}>
              <div className="p-12 text-center">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'ar' ? 'لا توجد وثائق مفهرسة' : 'No indexed documents found'}
                </h3>
                <p className="text-gray-600">
                  {language === 'ar' ? 'ارفع وثائق لبناء قاعدة المعرفة' : 'Upload documents to build the knowledge base'}
                </p>
              </div>
            </AnimatedCard>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'ar' ? 'تاريخ الاستعلامات' : 'Query History'}
          </h3>

          <div className="space-y-4">
            {queryHistory.map((query) => (
              <AnimatedCard key={query.id} hover3D={true} culturalPattern={true}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium mb-2">{query.question}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{query.answer}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {getQueryStatusIcon(query.status)}
                      <span className="text-xs text-gray-500">{query.timestamp}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>
                        {language === 'ar' ? 'وقت الاستجابة:' : 'Response time:'} {query.responseTime || '0ms'}
                      </span>
                      <span>
                        {language === 'ar' ? 'المصادر:' : 'Sources:'} {query.sourcesCount || 0}
                      </span>
                    </div>
                    <span className={`font-medium ${getAccuracyColor(query.confidence * 100)}`}>
                      {Math.round((query.confidence || 0) * 100)}% {language === 'ar' ? 'ثقة' : 'confidence'}
                    </span>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>

          {queryHistory.length === 0 && !loading && (
            <AnimatedCard hover3D={false} culturalPattern={true}>
              <div className="p-12 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'ar' ? 'لا يوجد تاريخ استعلامات' : 'No query history found'}
                </h3>
                <p className="text-gray-600">
                  {language === 'ar' ? 'ابدأ بطرح أسئلة لبناء تاريخ الاستعلامات' : 'Start asking questions to build query history'}
                </p>
              </div>
            </AnimatedCard>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-64">
          <CulturalLoadingSpinner size="large" />
        </div>
      )}
    </div>
  );
};

export default RAGServicePage;
