import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Users, MessageSquare, Clock,
  CheckCircle, AlertTriangle, FileText, Edit3
} from 'lucide-react';
import { useAssessmentCollaboration, useDocumentCollaboration } from '../../hooks/useWebSocket';
import { CollaborationIndicator, WorkflowNotificationPanel, RealTimeEditor, RealtimeField } from '../../components/collaboration';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';

const AssessmentDetailsCollaborative = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessment, setAssessment] = useState(null);

  // Fetch real assessment data from API
  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const response = await apiService.assessments.getById(id);
      if (response?.data?.success && response.data.data) {
        setAssessment(response.data.data);
      } else {
        toast.error('Assessment not found');
        navigate('/assessments');
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
      toast.error('Failed to load assessment');
      navigate('/assessments');
    } finally {
      setLoading(false);
    }
  };

  // Save assessment changes to API
  const saveAssessment = async () => {
    if (!assessment) return;
    
    try {
      setSaving(true);
      const response = await apiService.assessments.update(id, assessment);
      if (response?.data?.success) {
        toast.success('Assessment saved successfully');
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  // Real-time collaboration hooks
  const {
    collaborators,
    isConnected,
    lastUpdate,
    updateField
  } = useAssessmentCollaboration(id);

  // Handle real-time updates from other users
  useEffect(() => {
    if (lastUpdate && lastUpdate.assessmentId === id) {
      setAssessment(prev => ({
        ...prev,
        [lastUpdate.field]: lastUpdate.value
      }));

      // Show a brief notification about the update
      console.log(`Field "${lastUpdate.field}" updated by user ${lastUpdate.updatedBy}`);
    }
  }, [lastUpdate, id]);

  const handleFieldUpdate = (field, value) => {
    // Update local state immediately for responsive UI
    setAssessment(prev => ({ ...prev, [field]: value }));

    // Send update to other users via WebSocket
    updateField(field, value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'not_started': return 'text-gray-600 bg-gray-100';
      case 'blocked': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/app/assessments')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>
                  <ArabicTextEngine
                    text={language === 'ar' ? 'العودة إلى التقييمات' : 'Back to Assessments'}
                    language={language}
                  />
                </span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Collaboration Indicator */}
              <CollaborationIndicator
                assessmentId={id}
                className="hidden md:flex"
              />

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
                <WorkflowNotificationPanel
                  isOpen={showNotifications}
                  onClose={() => setShowNotifications(false)}
                />
              </div>

              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(prev => prev === 'ar' ? 'en' : 'ar')}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                {language === 'ar' ? 'EN' : 'العربية'}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              <ArabicTextEngine
                text={language === 'ar' ? (assessment?.titleAr || assessment?.title || 'Loading...') : (assessment?.title || 'Loading...')}
                language={language}
              />
            </h1>
            <p className="text-lg text-gray-600 mt-2">{assessment?.organization || 'Loading organization...'}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Assessment Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <ArabicTextEngine
                  text={language === 'ar' ? 'معلومات التقييم' : 'Assessment Information'}
                  language={language}
                />
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ArabicTextEngine
                      text={language === 'ar' ? 'عنوان التقييم' : 'Assessment Title'}
                      language={language}
                    />
                  </label>
                  <RealtimeField
                    resourceType="assessment"
                    resourceId={id}
                    field="title"
                    initialValue={assessment?.title || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter assessment title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ArabicTextEngine
                      text={language === 'ar' ? 'الحالة' : 'Status'}
                      language={language}
                    />
                  </label>
                  <RealtimeField
                    resourceType="assessment"
                    resourceId={id}
                    field="status"
                    type="select"
                    initialValue={assessment?.status || 'not_started'}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${assessment?.status ? getStatusColor(assessment.status) : 'text-gray-600 bg-gray-100'}`}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </RealtimeField>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ArabicTextEngine
                      text={language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
                      language={language}
                    />
                  </label>
                  <RealtimeField
                    resourceType="assessment"
                    resourceId={id}
                    field="dueDate"
                    type="date"
                    initialValue={assessment?.dueDate || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ArabicTextEngine
                      text={language === 'ar' ? 'المقيم' : 'Assessor'}
                      language={language}
                    />
                  </label>
                  <RealtimeField
                    resourceType="assessment"
                    resourceId={id}
                    field="assessor"
                    initialValue={assessment?.assessor || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter assessor name..."
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <ArabicTextEngine
                  text={language === 'ar' ? 'وصف التقييم' : 'Assessment Description'}
                  language={language}
                />
              </h3>
              <RealtimeField
                resourceType="assessment"
                resourceId={id}
                field="description"
                type="textarea"
                initialValue={assessment?.description || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Enter assessment description..."
              />
            </div>

            {/* Real-time Collaborative Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Edit3 className="h-5 w-5" />
                <span>
                  <ArabicTextEngine
                    text={language === 'ar' ? 'الملاحظات التعاونية' : 'Collaborative Notes'}
                    language={language}
                  />
                </span>
              </h3>
              <RealTimeEditor
                documentId={`assessment_notes_${id}`}
                content={assessment?.findings || ''}
                onChange={(content) => handleFieldUpdate('findings', content)}
                className="min-h-[200px]"
              />
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <ArabicTextEngine
                  text={language === 'ar' ? 'التوصيات' : 'Recommendations'}
                  language={language}
                />
              </h3>
              <RealTimeEditor
                documentId={`assessment_recommendations_${id}`}
                content={assessment?.recommendations || ''}
                onChange={(content) => handleFieldUpdate('recommendations', content)}
                className="min-h-[150px]"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Collaboration Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>
                  <ArabicTextEngine
                    text={language === 'ar' ? 'التعاون المباشر' : 'Live Collaboration'}
                    language={language}
                  />
                </span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    <ArabicTextEngine
                      text={isConnected
                        ? (language === 'ar' ? 'متصل' : 'Connected')
                        : (language === 'ar' ? 'غير متصل' : 'Disconnected')
                      }
                      language={language}
                    />
                  </span>
                </div>

                {collaborators.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      <ArabicTextEngine
                        text={language === 'ar' ? 'المتعاونون النشطون' : 'Active Collaborators'}
                        language={language}
                      />
                    </p>
                    <div className="space-y-2">
                      {collaborators.map(userId => (
                        <div key={userId} className="flex items-center space-x-2">
                          <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {userId.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-600">User {userId}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>
                  <ArabicTextEngine
                    text={language === 'ar' ? 'التقدم' : 'Progress'}
                    language={language}
                  />
                </span>
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Overall Progress</span>
                    <span>{assessment?.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${assessment?.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center text-green-600 mb-1">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">102</div>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-center text-yellow-600 mb-1">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">54</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Updates */}
            {lastUpdate && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <ArabicTextEngine
                    text={language === 'ar' ? 'آخر التحديثات' : 'Recent Updates'}
                    language={language}
                  />
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Field "{lastUpdate.field}" was updated by {lastUpdate.updatedBy}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {new Date(lastUpdate.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDetailsCollaborative;
