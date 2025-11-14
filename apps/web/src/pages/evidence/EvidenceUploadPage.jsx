import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Upload, FileText, CheckCircle2, XCircle, AlertTriangle,
  File, Image, FileSpreadsheet, FileCode, Shield,
  Trash2, Download, Eye, Plus, X
} from 'lucide-react';

/**
 * EVIDENCE UPLOAD PAGE
 * ===================
 * Complete evidence submission system with drag-drop, validation, and type management
 *
 * Features:
 * - Drag-drop file upload
 * - 23 evidence types (Policy, Configuration, Report, Record, Certificate, etc.)
 * - File validation (size, format, naming)
 * - Evidence metadata (description, date, version)
 * - Multiple file support per control
 * - Evidence preview
 * - Status tracking (pending, approved, rejected)
 *
 * STATUS: 🚧 Backend APIs in Development
 */

const EvidenceUploadPage = () => {
  const { assessmentId, controlId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [control, setControl] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Upload form state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [evidenceType, setEvidenceType] = useState('policy_standard');
  const [description, setDescription] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [version, setVersion] = useState('');
  const [notes, setNotes] = useState('');

  // 23 Evidence Types (Shahin Standard)
  const EVIDENCE_TYPES = [
    { value: 'policy_standard', label: 'Policy/Standard', labelAr: 'سياسة/معيار', icon: FileText },
    { value: 'configuration_capture', label: 'Configuration/Capture', labelAr: 'تكوين/لقطة', icon: FileCode },
    { value: 'report_review', label: 'Report/Review', labelAr: 'تقرير/مراجعة', icon: FileSpreadsheet },
    { value: 'record_log', label: 'Record/Log', labelAr: 'سجل/أرشيف', icon: File },
    { value: 'certificate', label: 'Certificate', labelAr: 'شهادة', icon: Shield },
    { value: 'contract_agreement', label: 'Contract/Agreement', labelAr: 'عقد/اتفاقية', icon: FileText },
    { value: 'screenshot', label: 'Screenshot', labelAr: 'لقطة شاشة', icon: Image },
    { value: 'audit_report', label: 'Audit Report', labelAr: 'تقرير مراجعة', icon: FileSpreadsheet },
    { value: 'risk_assessment', label: 'Risk Assessment', labelAr: 'تقييم مخاطر', icon: AlertTriangle },
    { value: 'meeting_minutes', label: 'Meeting Minutes', labelAr: 'محضر اجتماع', icon: FileText },
    { value: 'training_record', label: 'Training Record', labelAr: 'سجل تدريب', icon: File },
    { value: 'incident_report', label: 'Incident Report', labelAr: 'تقرير حادثة', icon: AlertTriangle },
    { value: 'vulnerability_scan', label: 'Vulnerability Scan', labelAr: 'فحص ثغرات', icon: Shield },
    { value: 'penetration_test', label: 'Penetration Test', labelAr: 'اختبار اختراق', icon: Shield },
    { value: 'backup_log', label: 'Backup Log', labelAr: 'سجل نسخ احتياطي', icon: File },
    { value: 'change_request', label: 'Change Request', labelAr: 'طلب تغيير', icon: FileText },
    { value: 'access_log', label: 'Access Log', labelAr: 'سجل وصول', icon: File },
    { value: 'system_diagram', label: 'System Diagram', labelAr: 'رسم توضيحي', icon: Image },
    { value: 'vendor_assessment', label: 'Vendor Assessment', labelAr: 'تقييم مورد', icon: FileSpreadsheet },
    { value: 'compliance_attestation', label: 'Compliance Attestation', labelAr: 'إقرار امتثال', icon: Shield },
    { value: 'data_flow_diagram', label: 'Data Flow Diagram', labelAr: 'مخطط تدفق بيانات', icon: Image },
    { value: 'disaster_recovery_plan', label: 'Disaster Recovery Plan', labelAr: 'خطة استعادة كوارث', icon: FileText },
    { value: 'other', label: 'Other', labelAr: 'أخرى', icon: File }
  ];

  // Allowed file formats
  const ALLOWED_FORMATS = {
    documents: ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.txt'],
    images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'],
    configs: ['.json', '.xml', '.yaml', '.yml', '.ini', '.conf', '.cfg'],
    archives: ['.zip', '.rar', '.7z', '.tar', '.gz']
  };

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  useEffect(() => {
    fetchControlData();
    fetchEvidence();
  }, [assessmentId, controlId]);

  const fetchControlData = async () => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/controls/${controlId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setControl(data);
    } catch (error) {
      console.error('Error fetching control:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidence = async () => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/controls/${controlId}/evidence`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setEvidenceList(data);
    } catch (error) {
      console.error('Error fetching evidence:', error);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFileSelection(files);
  };

  const handleFileSelection = (files) => {
    const validFiles = files.filter(file => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} exceeds 50MB limit`);
        return false;
      }

      // Check file format
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      const allFormats = [...ALLOWED_FORMATS.documents, ...ALLOWED_FORMATS.images, ...ALLOWED_FORMATS.configs, ...ALLOWED_FORMATS.archives];

      if (!allFormats.includes(extension)) {
        alert(`File ${file.name} has unsupported format`);
        return false;
      }

      return true;
    });

    setSelectedFiles([...selectedFiles, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      alert('Please select at least one file');
      return;
    }

    if (!description) {
      alert('Please provide a description');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      formData.append('evidenceType', evidenceType);
      formData.append('description', description);
      formData.append('effectiveDate', effectiveDate);
      formData.append('version', version);
      formData.append('notes', notes);
      formData.append('assessmentId', assessmentId);
      formData.append('controlId', controlId);

      const response = await fetch('/api/evidence/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      if (response.ok) {
        alert('Evidence uploaded successfully');

        // Reset form
        setSelectedFiles([]);
        setDescription('');
        setEffectiveDate('');
        setVersion('');
        setNotes('');
        setEvidenceType('policy_standard');

        // Refresh evidence list
        fetchEvidence();
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error uploading evidence:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deleteEvidence = async (evidenceId) => {
    if (!confirm('Are you sure you want to delete this evidence?')) {
      return;
    }

    try {
      const response = await fetch(`/api/evidence/${evidenceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        fetchEvidence();
      } else {
        alert('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting evidence:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading control...</p>
        </div>
      </div>
    );
  }

  if (!control) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Control not found</p>
        </div>
      </div>
    );
  }

  const selectedTypeInfo = EVIDENCE_TYPES.find(t => t.value === evidenceType);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <button
            onClick={() => navigate(`/assessments/${assessmentId}`)}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Back to Assessment
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Evidence</h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">Control: {control.controlId}</p>
            <p className="text-lg text-blue-800 mt-1">{control.title}</p>
            {control.titleAr && (
              <p className="text-sm text-blue-700 mt-1" dir="rtl">{control.titleAr}</p>
            )}
          </div>

          {/* Evidence Requirements */}
          {control.evidenceRequired && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-900 mb-2">Evidence Requirements:</p>
              <p className="text-sm text-yellow-800">{control.evidenceRequired}</p>
              <p className="text-xs text-yellow-700 mt-2">
                ⚠️ Minimum 3 pieces of evidence required for scoring
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Form */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload New Evidence</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Evidence Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evidence Type *
                </label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {EVIDENCE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} ({type.labelAr})
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Files * (Max 50MB per file)
                </label>

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag & drop files here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    PDF, Word, Excel, Images, Configs, Archives supported
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Select Files
                  </button>
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <File className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe this evidence..."
                  required
                />
              </div>

              {/* Effective Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective Date
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Version */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1.0, 2.3, etc."
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional information..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading || selectedFiles.length === 0}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Evidence
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Existing Evidence */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Existing Evidence ({evidenceList.length})
            </h2>

            {evidenceList.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No evidence uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {evidenceList.map(evidence => {
                  const typeInfo = EVIDENCE_TYPES.find(t => t.value === evidence.evidenceType);
                  const IconComponent = typeInfo?.icon || File;

                  return (
                    <div key={evidence.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <IconComponent className="w-5 h-5 text-blue-600 mt-1" />
                          <div>
                            <p className="font-medium text-gray-900">{evidence.fileName}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {typeInfo?.label} • {new Date(evidence.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          evidence.status === 'approved' ? 'bg-green-100 text-green-800' :
                          evidence.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {evidence.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{evidence.description}</p>

                      {evidence.version && (
                        <p className="text-xs text-gray-500 mb-3">Version: {evidence.version}</p>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open(evidence.fileUrl, '_blank')}
                          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => window.open(evidence.fileUrl + '?download=true', '_blank')}
                          className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={() => deleteEvidence(evidence.id)}
                          className="flex items-center gap-2 px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceUploadPage;
