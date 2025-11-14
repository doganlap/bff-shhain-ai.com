import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FiUpload, FiFile, FiX, FiCheck, FiAlertCircle,
  FiImage, FiFileText, FiDownload
} from 'react-icons/fi';
import { useI18n } from '../../hooks/useI18n';
import api from '../../services/api';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
];

const EvidenceUpload = ({ taskId, existingEvidence = [], onUploadComplete }) => {
  const { language } = useI18n();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState(existingEvidence);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(f => f.errors[0]?.message).join(', ');
      setError(errors);
      return;
    }

    const validFiles = acceptedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} exceeds 10MB limit`);
        return false;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`File ${file.name} type not allowed`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending'
    }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv']
    }
  });

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      // Upload each file
      const uploadPromises = files.map(async (fileItem) => {
        const formData = new FormData();
        formData.append('file', fileItem.file);
        formData.append('taskId', taskId);
        formData.append('fileName', fileItem.name);

        try {
          setUploadProgress(prev => ({ ...prev, [fileItem.id]: 0 }));

          const response = await api.post('/api/tasks/evidence/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(prev => ({ ...prev, [fileItem.id]: progress }));
            }
          });

          setFiles(prev => prev.map(f =>
            f.id === fileItem.id ? { ...f, status: 'success' } : f
          ));

          return response.data.evidence;
        } catch (err) {
          setFiles(prev => prev.map(f =>
            f.id === fileItem.id ? { ...f, status: 'error', error: err.message } : f
          ));
          throw err;
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);

      setUploadedFiles(prev => [...prev, ...successfulUploads]);

      // Clear successful uploads from pending list
      setFiles(prev => prev.filter(f => f.status !== 'success'));

      if (onUploadComplete) {
        onUploadComplete(successfulUploads);
      }

    } catch (err) {
      setError('Some files failed to upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return FiImage;
    if (fileType === 'application/pdf') return FiFileText;
    return FiFile;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isDragActive ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <FiUpload className={`text-3xl ${isDragActive ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900 mb-1">
              {language === 'ar'
                ? isDragActive ? 'أفلت الملفات هنا' : 'اسحب الملفات وأفلتها هنا'
                : isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-500">
              {language === 'ar'
                ? 'أو انقر للتصفح'
                : 'or click to browse'}
            </p>
          </div>
          <div className="text-xs text-gray-400">
            <p>{language === 'ar' ? 'الحد الأقصى: 10 ميجابايت' : 'Max size: 10MB'}</p>
            <p>{language === 'ar' ? 'الصيغ المدعومة' : 'Supported'}: PDF, Word, Excel, Images, TXT, CSV</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <FiAlertCircle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">
              {language === 'ar' ? 'خطأ في الرفع' : 'Upload Error'}
            </p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Pending Files */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              {language === 'ar' ? 'الملفات المعلقة' : 'Pending Upload'} ({files.length})
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {files.map((fileItem) => {
              const Icon = getFileIcon(fileItem.type);
              const progress = uploadProgress[fileItem.id] || 0;

              return (
                <div key={fileItem.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{fileItem.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(fileItem.size)}</p>
                    {uploading && fileItem.status === 'pending' && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">
                            {language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
                          </span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {fileItem.status === 'success' && (
                      <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                        <FiCheck /> {language === 'ar' ? 'تم الرفع' : 'Uploaded'}
                      </p>
                    )}
                    {fileItem.status === 'error' && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <FiAlertCircle /> {fileItem.error || 'Upload failed'}
                      </p>
                    )}
                  </div>
                  {!uploading && (
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <FiX className="text-gray-600" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end">
            <button
              onClick={uploadFiles}
              disabled={uploading || files.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiUpload />
              {uploading
                ? (language === 'ar' ? 'جاري الرفع...' : 'Uploading...')
                : (language === 'ar' ? 'رفع الملفات' : 'Upload Files')}
            </button>
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              {language === 'ar' ? 'الملفات المرفوعة' : 'Uploaded Evidence'} ({uploadedFiles.length})
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {uploadedFiles.map((file, index) => {
              const Icon = getFileIcon(file.file_type || 'application/pdf');

              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{file.file_name || file.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {file.file_size && <span>{formatFileSize(file.file_size)}</span>}
                      {file.uploaded_at && (
                        <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                      )}
                      {file.uploaded_by_name && (
                        <span>{language === 'ar' ? 'بواسطة' : 'by'} {file.uploaded_by_name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      <FiCheck className="inline mr-1" />
                      {language === 'ar' ? 'مكتمل' : 'Uploaded'}
                    </span>
                    {file.file_url && (
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <FiDownload className="text-gray-600" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceUpload;
