/**
 * Auto Assessment Generator Page
 * Generate assessments automatically based on tenant/organization profile
 */

import React, { useState, useEffect } from 'react';
import {
  Zap, Building2, FileText, CheckCircle, AlertCircle, 
  Clock, Users, Shield, TrendingUp, Eye, Play, 
  Loader2, Download, Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../components/theme/ThemeProvider';
import { useI18n } from '../../hooks/useI18n';

export default function AutoAssessmentGeneratorPage() {
  const { isDark } = useTheme();
  const { t, isRTL } = useI18n();
  
  const [step, setStep] = useState(1); // 1: Select, 2: Preview, 3: Generate, 4: Results
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [preview, setPreview] = useState(null);
  const [generatedAssessment, setGeneratedAssessment] = useState(null);
  const [options, setOptions] = useState({
    maxFrameworks: 3,
    assessmentType: 'regulatory_compliance',
    priority: 'high',
    includeSecondaryRegulators: true
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tenants', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setTenants(data.data);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleTenantSelect = async (tenant) => {
    setSelectedTenant(tenant);
    setStep(2);
    await generatePreview(tenant.id);
  };

  const generatePreview = async (tenantId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/auto-assessment/preview/${tenantId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Tenant-ID': tenantId
        }
      });
      const data = await response.json();
      if (data.success) {
        setPreview(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const generateAssessment = async () => {
    try {
      setLoading(true);
      setStep(3);
      
      const response = await fetch(`/api/auto-assessment/generate-from-tenant/${selectedTenant.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Tenant-ID': selectedTenant.id,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });
      
      const data = await response.json();
      if (data.success) {
        setGeneratedAssessment(data.data);
        setStep(4);
        toast.success('Assessment generated successfully!');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error generating assessment:', error);
      toast.error('Failed to generate assessment');
      setStep(2); // Go back to preview
    } finally {
      setLoading(false);
    }
  };

  const resetGenerator = () => {
    setStep(1);
    setSelectedTenant(null);
    setPreview(null);
    setGeneratedAssessment(null);
  };

  return (
    <div className={`min-h-screen ${isDark() ? 'bg-gray-900' : 'bg-gray-50'} p-6`} dir={isRTL() ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                Auto Assessment Generator
              </h1>
              <p className={`text-lg ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                Generate comprehensive assessments automatically based on company profile and KSA regulators
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {[
              { num: 1, label: 'Select Tenant', icon: Building2 },
              { num: 2, label: 'Preview', icon: Eye },
              { num: 3, label: 'Generate', icon: Play },
              { num: 4, label: 'Results', icon: CheckCircle }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                    step >= s.num
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {step > s.num ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <s.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`mt-2 text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-1 ${
                    step > s.num ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Tenant Selection */}
        {step === 1 && (
          <div className={`rounded-lg shadow-md p-8 ${isDark() ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              Select Tenant for Assessment Generation
            </h2>
            
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
                <p className={isDark() ? 'text-gray-400' : 'text-gray-600'}>Loading tenants...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    onClick={() => handleTenantSelect(tenant)}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                      isDark()
                        ? 'border-gray-700 bg-gray-700 hover:border-blue-600'
                        : 'border-gray-200 bg-white hover:border-blue-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        tenant.subscription_tier === 'enterprise'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {tenant.subscription_tier}
                      </span>
                    </div>
                    
                    <h3 className={`text-lg font-bold mb-2 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                      {tenant.name}
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className={`flex items-center gap-2 ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Shield className="w-4 h-4" />
                        <span>Sector: {tenant.sector || 'Not specified'}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Users className="w-4 h-4" />
                        <span>Industry: {tenant.industry || 'Not specified'}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                        <FileText className="w-4 h-4" />
                        <span>{tenant.assessment_count || 0} assessments</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 2 && preview && (
          <div className={`rounded-lg shadow-md p-8 ${isDark() ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                Assessment Preview
              </h2>
              <button
                onClick={resetGenerator}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Change Tenant
              </button>
            </div>

            {/* Tenant Info */}
            <div className={`rounded-lg p-6 mb-6 ${isDark() ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-bold mb-4 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                {preview.tenantProfile.name}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className={isDark() ? 'text-gray-400' : 'text-gray-600'}>Sector:</span>
                  <div className={`font-medium ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                    {preview.tenantProfile.sector}
                  </div>
                </div>
                <div>
                  <span className={isDark() ? 'text-gray-400' : 'text-gray-600'}>Industry:</span>
                  <div className={`font-medium ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                    {preview.tenantProfile.industry}
                  </div>
                </div>
                <div>
                  <span className={isDark() ? 'text-gray-400' : 'text-gray-600'}>Country:</span>
                  <div className={`font-medium ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                    {preview.tenantProfile.country}
                  </div>
                </div>
                <div>
                  <span className={isDark() ? 'text-gray-400' : 'text-gray-600'}>Organizations:</span>
                  <div className={`font-medium ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                    {preview.tenantProfile.organization_count}
                  </div>
                </div>
              </div>
            </div>

            {/* Applicable Regulators */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Primary Regulators */}
              <div className={`rounded-lg p-6 ${isDark() ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                <h4 className={`text-lg font-bold mb-4 text-blue-600`}>
                  Primary Regulators ({preview.regulators.primary.length})
                </h4>
                <div className="space-y-2">
                  {preview.regulators.primary.map((regulator, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className={`font-medium ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                        {regulator}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secondary Regulators */}
              <div className={`rounded-lg p-6 ${isDark() ? 'bg-green-900/20' : 'bg-green-50'}`}>
                <h4 className={`text-lg font-bold mb-4 text-green-600`}>
                  Secondary Regulators ({preview.regulators.secondary.length})
                </h4>
                <div className="space-y-2">
                  {preview.regulators.secondary.map((regulator, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className={`font-medium ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                        {regulator}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Frameworks */}
            <div className={`rounded-lg p-6 mb-6 ${isDark() ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`text-lg font-bold mb-4 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                Applicable Frameworks ({preview.regulators.frameworks.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {preview.regulators.frameworks.map((framework, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${isDark() ? 'bg-gray-600' : 'bg-white'} border`}>
                    <FileText className="w-5 h-5 text-blue-600 mb-2" />
                    <span className={`text-sm font-medium ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                      {framework}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className={`text-center p-4 rounded-lg ${isDark() ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {preview.estimatedMetrics.regulatorCount}
                </div>
                <div className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Regulators
                </div>
              </div>
              <div className={`text-center p-4 rounded-lg ${isDark() ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {preview.estimatedMetrics.estimatedControls}
                </div>
                <div className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                  Est. Controls
                </div>
              </div>
              <div className={`text-center p-4 rounded-lg ${isDark() ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {preview.estimatedMetrics.estimatedDuration}h
                </div>
                <div className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                  Est. Duration
                </div>
              </div>
              <div className={`text-center p-4 rounded-lg ${isDark() ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-2xl font-bold mb-1 ${
                  preview.estimatedMetrics.complexity === 'high' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {preview.estimatedMetrics.complexity}
                </div>
                <div className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                  Complexity
                </div>
              </div>
            </div>

            {/* Generation Options */}
            <div className={`rounded-lg p-6 mb-6 ${isDark() ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`text-lg font-bold mb-4 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                Generation Options
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    Max Frameworks
                  </label>
                  <select
                    value={options.maxFrameworks}
                    onChange={(e) => setOptions({...options, maxFrameworks: parseInt(e.target.value)})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark()
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value={2}>2 Frameworks</option>
                    <option value={3}>3 Frameworks</option>
                    <option value={5}>5 Frameworks</option>
                    <option value={10}>All Frameworks</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    Priority Level
                  </label>
                  <select
                    value={options.priority}
                    onChange={(e) => setOptions({...options, priority: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark()
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Priority</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeSecondaryRegulators}
                    onChange={(e) => setOptions({...options, includeSecondaryRegulators: e.target.checked})}
                    className="rounded"
                  />
                  <span className={`text-sm ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    Include secondary regulators
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={resetGenerator}
                className={`px-6 py-3 rounded-lg border ${
                  isDark()
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Back to Selection
              </button>
              <button
                onClick={generateAssessment}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                Generate Assessment
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generating */}
        {step === 3 && (
          <div className={`rounded-lg shadow-md p-8 text-center ${isDark() ? 'bg-gray-800' : 'bg-white'}`}>
            <Loader2 className="w-16 h-16 animate-spin mx-auto text-blue-600 mb-6" />
            <h2 className={`text-2xl font-bold mb-4 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              Generating Assessment...
            </h2>
            <p className={`text-lg ${isDark() ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
              AI is analyzing your profile and creating a comprehensive assessment
            </p>
            <div className="space-y-2 text-left max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className={isDark() ? 'text-gray-300' : 'text-gray-700'}>
                  Analyzing company profile
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className={isDark() ? 'text-gray-300' : 'text-gray-700'}>
                  Mapping KSA regulators
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className={isDark() ? 'text-gray-300' : 'text-gray-700'}>
                  Generating controls and questions
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && generatedAssessment && (
          <div className={`rounded-lg shadow-md p-8 ${isDark() ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className={`text-2xl font-bold mb-2 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                Assessment Generated Successfully!
              </h2>
              <p className={`text-lg ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                Your comprehensive assessment is ready for {generatedAssessment.organization}
              </p>
            </div>

            {/* Assessment Summary */}
            <div className={`rounded-lg p-6 mb-6 ${isDark() ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-bold mb-4 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                Assessment Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className={isDark() ? 'text-gray-400' : 'text-gray-600'}>Assessment ID:</span>
                  <div className={`font-mono text-xs ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                    {generatedAssessment.assessment.id}
                  </div>
                </div>
                <div>
                  <span className={isDark() ? 'text-gray-400' : 'text-gray-600'}>Regulators Covered:</span>
                  <div className={`font-medium ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                    {generatedAssessment.regulators.primary.length} Primary
                  </div>
                </div>
                <div>
                  <span className={isDark() ? 'text-gray-400' : 'text-gray-600'}>Status:</span>
                  <div className="font-medium text-green-600">
                    Ready for Review
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => window.open(`/app/assessments/${generatedAssessment.assessment.id}`, '_blank')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Eye className="w-5 h-5" />
                View Assessment
              </button>
              <button
                onClick={() => toast.info('Export functionality coming soon')}
                className={`px-6 py-3 rounded-lg border flex items-center gap-2 ${
                  isDark()
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Download className="w-5 h-5" />
                Export Report
              </button>
              <button
                onClick={() => toast.info('Share functionality coming soon')}
                className={`px-6 py-3 rounded-lg border flex items-center gap-2 ${
                  isDark()
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
              <button
                onClick={resetGenerator}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Generate Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
