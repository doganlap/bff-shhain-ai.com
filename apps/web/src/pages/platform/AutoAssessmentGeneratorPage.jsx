/**
 * Auto Assessment Generator Page
 * Generate assessments automatically based on tenant/organization profile
 */

import React, { useState, useEffect, useCallback } from 'react';
import EnterprisePageLayout from '../../components/layout/EnterprisePageLayout';
import apiService from '../../services/apiEndpoints';
import { toast } from 'sonner';
import {
  Zap, Building2, FileText, CheckCircle, Users, Shield, Eye, Play,
  Loader2, Download, Share2, RefreshCw
} from 'lucide-react';

export default function AutoAssessmentGeneratorPage() {
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

  const loadTenants = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.tenants.getAll();
      if (data.success) {
        setTenants(data.data);
      } else {
        setTenants(data.data || data || []);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      toast.error('Failed to load tenants');
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const handleTenantSelect = async (tenant) => {
    setSelectedTenant(tenant);
    setStep(2);
    await generatePreview(tenant.id);
  };

  const generatePreview = async (tenantId) => {
    try {
      setLoading(true);
      const data = await apiService.autoAssessment.getPreview(tenantId);
      if (data.success) {
        setPreview(data.data);
      } else {
        throw new Error(data.message || 'Failed to generate preview');
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

      const data = await apiService.autoAssessment.generate(selectedTenant.id, options);
      if (data.success) {
        setGeneratedAssessment(data.data);
        setStep(4);
        toast.success('Assessment generated successfully!');
      } else {
        throw new Error(data.message || 'Failed to generate assessment');
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
    <EnterprisePageLayout
      title="Auto Assessment Generator"
      subtitle="Generate comprehensive assessments automatically based on company profile and regulators"
      actions={
        step > 1 && (
          <button
            onClick={resetGenerator}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Start Over
          </button>
        )
      }
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4">
          {[
            { num: 1, label: 'Select Tenant', icon: Building2 },
            { num: 2, label: 'Preview', icon: Eye },
            { num: 3, label: 'Generate', icon: Play },
            { num: 4, label: 'Results', icon: CheckCircle }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-colors ${
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
                <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">
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

        {/* Step 1: Tenant Selection */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Select Tenant for Assessment Generation
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading tenants...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    onClick={() => handleTenantSelect(tenant)}
                    className="p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-blue-600"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        tenant.subscription_tier === 'enterprise'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {tenant.subscription_tier || 'Standard'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                      {tenant.name}
                    </h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Shield className="w-4 h-4" />
                        <span>Sector: {tenant.sector || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>Industry: {tenant.industry || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FileText className="w-4 h-4" />
                        <span>{tenant.assessment_count || 0} assessments</span>
                      </div>
                    </div>
                  </div>
                ))}

                {tenants.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">No tenants found</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Please create a tenant first to generate assessments.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 2 && preview && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
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
            <div className="rounded-lg p-6 mb-6 bg-gray-50 dark:bg-gray-700">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                {preview.tenantProfile?.name || selectedTenant?.name}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Sector:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {preview.tenantProfile?.sector || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Industry:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {preview.tenantProfile?.industry || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Country:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {preview.tenantProfile?.country || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Organizations:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {preview.tenantProfile?.organization_count || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Applicable Regulators */}
            {preview.regulators && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Primary Regulators */}
                <div className="rounded-lg p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-lg font-bold mb-4 text-blue-600 dark:text-blue-400">
                    Primary Regulators ({preview.regulators.primary?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {(preview.regulators.primary || []).map((regulator, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {regulator}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secondary Regulators */}
                <div className="rounded-lg p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <h4 className="text-lg font-bold mb-4 text-green-600 dark:text-green-400">
                    Secondary Regulators ({preview.regulators.secondary?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {(preview.regulators.secondary || []).map((regulator, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {regulator}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Frameworks */}
            {preview.regulators?.frameworks && (
              <div className="rounded-lg p-6 mb-6 bg-gray-50 dark:bg-gray-700">
                <h4 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                  Applicable Frameworks ({preview.regulators.frameworks.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {preview.regulators.frameworks.map((framework, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {framework}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estimated Metrics */}
            {preview.estimatedMetrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {preview.estimatedMetrics.regulatorCount || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Regulators
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {preview.estimatedMetrics.estimatedControls || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Est. Controls
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {preview.estimatedMetrics.estimatedDuration || 0}h
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Est. Duration
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className={`text-2xl font-bold mb-1 ${
                    preview.estimatedMetrics.complexity === 'high' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {preview.estimatedMetrics.complexity || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Complexity
                  </div>
                </div>
              </div>
            )}

            {/* Generation Options */}
            <div className="rounded-lg p-6 mb-6 bg-gray-50 dark:bg-gray-700">
              <h4 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                Generation Options
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Max Frameworks
                  </label>
                  <select
                    value={options.maxFrameworks}
                    onChange={(e) => setOptions({ ...options, maxFrameworks: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={2}>2 Frameworks</option>
                    <option value={3}>3 Frameworks</option>
                    <option value={5}>5 Frameworks</option>
                    <option value={10}>All Frameworks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Priority Level
                  </label>
                  <select
                    value={options.priority}
                    onChange={(e) => setOptions({ ...options, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                    onChange={(e) => setOptions({ ...options, includeSecondaryRegulators: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Include secondary regulators
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={resetGenerator}
                className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
            <Loader2 className="w-16 h-16 animate-spin mx-auto text-blue-600 mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Generating Assessment...
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              AI is analyzing your profile and creating a comprehensive assessment
            </p>
            <div className="space-y-2 text-left max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">
                  Analyzing company profile
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">
                  Mapping regulators
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">
                  Generating controls and questions
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && generatedAssessment && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Assessment Generated Successfully!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Your comprehensive assessment is ready for {generatedAssessment.organization || selectedTenant?.name}
              </p>
            </div>

            {/* Assessment Summary */}
            <div className="rounded-lg p-6 mb-6 bg-gray-50 dark:bg-gray-700">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                Assessment Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Assessment ID:</span>
                  <div className="font-mono text-xs text-gray-900 dark:text-white">
                    {generatedAssessment.assessment?.id || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Regulators Covered:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {generatedAssessment.regulators?.primary?.length || 0} Primary
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <div className="font-medium text-green-600 dark:text-green-400">
                    Ready for Review
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => window.open(`/app/assessments/${generatedAssessment.assessment?.id}`, '_blank')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Eye className="w-5 h-5" />
                View Assessment
              </button>
              <button
                onClick={() => toast.info('Export functionality coming soon')}
                className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export Report
              </button>
              <button
                onClick={() => toast.info('Share functionality coming soon')}
                className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
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
    </EnterprisePageLayout>
  );
}
