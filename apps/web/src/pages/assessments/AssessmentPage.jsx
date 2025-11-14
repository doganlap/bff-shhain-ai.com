import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ControlCard,
  MaturityBadge
} from '../../components/cards/AssessmentCards';
import {
  Shield, CheckCircle2, XCircle, AlertTriangle, FileText,
  ChevronDown, ChevronRight, Filter, Search, Download
} from 'lucide-react';

/**
 * ASSESSMENT EXECUTION PAGE
 * ========================
 * Main page for executing assessments - shows 12 sections with controls,
 * evidence upload, scoring, and progress tracking.
 *
 * Features:
 * - 12 mandatory sections (Shahin standard)
 * - Control checklist with maturity levels
 * - Evidence upload per control
 * - Real-time scoring
 * - Progress tracking
 * - Bilingual support (AR/EN)
 */

const AssessmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [sections, setSections] = useState([]);
  const [expandedSection, setExpandedSection] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 12 Mandatory Sections (Shahin Standard)
  const SECTIONS = [
    { id: 1, name: 'Governance & Strategy', nameAr: 'الحوكمة والاستراتيجية' },
    { id: 2, name: 'Risk Management', nameAr: 'إدارة المخاطر' },
    { id: 3, name: 'Asset Management', nameAr: 'إدارة الأصول' },
    { id: 4, name: 'Access Control', nameAr: 'التحكم في الوصول' },
    { id: 5, name: 'Cryptography', nameAr: 'التشفير' },
    { id: 6, name: 'Physical Security', nameAr: 'الأمن المادي' },
    { id: 7, name: 'Operations Security', nameAr: 'أمن العمليات' },
    { id: 8, name: 'Communications Security', nameAr: 'أمن الاتصالات' },
    { id: 9, name: 'System Acquisition', nameAr: 'اقتناء الأنظمة' },
    { id: 10, name: 'Incident Management', nameAr: 'إدارة الحوادث' },
    { id: 11, name: 'Business Continuity', nameAr: 'استمرارية الأعمال' },
    { id: 12, name: 'Compliance', nameAr: 'الامتثال' }
  ];

  useEffect(() => {
    fetchAssessmentData();
  }, [id]);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/assessments/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setAssessment(data);

      // Fetch controls grouped by section
      const sectionsData = await Promise.all(
        SECTIONS.map(async (section) => {
          const controlsResponse = await fetch(
            `/api/assessments/${id}/sections/${section.id}/controls`,
            { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
          );
          const controls = await controlsResponse.json();

          return {
            ...section,
            controls,
            score: data[`section_${section.id}_score`] || 0,
            status: data[`section_${section.id}_status`] || 'not_started'
          };
        })
      );

      setSections(sectionsData);
    } catch (error) {
      console.error('Error fetching assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvidenceUpload = async (controlId) => {
    navigate(`/assessments/${id}/controls/${controlId}/evidence`);
  };

  const filteredSections = sections.map(section => ({
    ...section,
    controls: section.controls.filter(control => {
      const matchesStatus = filterStatus === 'all' || control.status === filterStatus;
      const matchesSearch = control.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           control.controlId.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Assessment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{assessment.title}</h1>
              {assessment.titleAr && (
                <p className="text-lg text-gray-600 mt-1" dir="rtl">{assessment.titleAr}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Assessment Type: {assessment.assessmentType} • Status: {assessment.status}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/assessments/${id}/report`)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export Report
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-bold text-blue-600">{assessment.progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${assessment.progress}%` }}
              />
            </div>
          </div>

          {/* Score Display */}
          {assessment.score && (
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                <p className="text-2xl font-bold text-blue-600">{assessment.score.toFixed(0)}%</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Completed Controls</p>
                <p className="text-2xl font-bold text-green-600">
                  {sections.reduce((sum, s) => sum + s.controls.filter(c => c.status === 'completed').length, 0)}
                </p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {sections.reduce((sum, s) => sum + s.controls.filter(c => c.status === 'in_progress').length, 0)}
                </p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Not Started</p>
                <p className="text-2xl font-bold text-red-600">
                  {sections.reduce((sum, s) => sum + s.controls.filter(c => c.status === 'not_started').length, 0)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search controls by ID or title..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* 12 Sections */}
        <div className="space-y-4">
          {filteredSections.map((section) => (
            <div key={section.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {expandedSection === section.id ? (
                    <ChevronDown className="w-6 h-6 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-gray-500" />
                  )}

                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900">
                      Section {section.id}: {section.name}
                    </h3>
                    <p className="text-sm text-gray-600" dir="rtl">{section.nameAr}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Controls</p>
                    <p className="text-lg font-bold text-gray-900">{section.controls.length}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">Score</p>
                    <p className={`text-lg font-bold ${section.score >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                      {section.score.toFixed(0)}%
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      section.status === 'completed' ? 'bg-green-100 text-green-800' :
                      section.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {section.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </button>

              {/* Section Controls */}
              {expandedSection === section.id && (
                <div className="border-t border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.controls.map(control => (
                      <ControlCard
                        key={control.id}
                        control={{
                          controlId: control.controlId,
                          title: control.title,
                          titleAr: control.titleAr,
                          maturityLevel: control.maturityLevel || 0,
                          evidenceCount: control.evidenceCount || 0,
                          score: control.score || 0,
                          isMandatory: control.isMandatory || false
                        }}
                        onClick={() => handleEvidenceUpload(control.id)}
                      />
                    ))}
                  </div>

                  {section.controls.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No controls found matching your filters
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
