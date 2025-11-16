import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, Shield,
  CheckCircle2, AlertCircle, Loader2, ChevronRight, ChevronLeft
} from 'lucide-react';

/**
 * ORGANIZATION ONBOARDING PAGE
 * ==========================
 * Complete automated onboarding with 50+ profile attributes for AI-powered
 * framework applicability analysis.
 *
 * Features:
 * - Multi-step wizard (5 steps)
 * - 50+ organization profile fields
 * - Real-time validation
 * - AI-powered framework selection
 * - Bilingual support (AR/EN)
 * - Automatic assessment generation
 * - Owner assignment
 * - Workflow seeding
 *
 * Execution: 5-15 seconds for complete onboarding
 */

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [onboardingResult, setOnboardingResult] = useState(null);

  // Form state with 50+ attributes
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    organizationName: '',
    organizationNameAr: '',
    registrationNumber: '',
    sector: '',
    country: 'SA',
    city: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    licenseType: '',

    // Step 2: Size & Structure
    employeeCount: '',
    annualRevenueSar: '',
    marketCapSar: '',
    organizationalStructure: 'single_entity',
    numberOfBranches: '',
    internationalPresence: false,
    countriesOperatingIn: [],

    // Step 3: Business Operations
    primaryBusinessActivities: [],
    secondaryActivities: [],
    businessModel: 'b2c',
    customerSegments: [],

    // Step 4: Technology & Data
    dataClassificationLevel: 'confidential',
    processesPii: false,
    piiVolume: 'low',
    processesFinancialData: false,
    processesHealthData: false,
    dataResidencyRequirements: [],
    crossBorderDataTransfer: false,
    hasOnlineServices: false,
    hasMobileApp: false,
    hasApiIntegrations: false,
    cloudUsage: 'none',
    cloudProviders: [],
    hostsCriticalInfrastructure: false,

    // Step 5: Security & Compliance
    processesPayments: false,
    paymentVolumDaily: '',
    paymentMethods: [],
    acceptsInternationalPayments: false,
    currencyOperations: ['SAR'],
    currentSecurityMaturity: 'developing',
    existingCertifications: [],
    securityTeamSize: '',
    dedicatedComplianceOfficer: false,
    incidentResponsePlan: false,
    riskAppetite: 'moderate',
    cyberInsurance: false,
    numberOfVendors: '',
    criticalVendors: '',
    outsourcedServices: [],
    thirdPartyRiskMgmt: false,
    totalCustomers: '',
    activeUsersMonthly: '',
    customerTypes: [],
    highNetWorthClients: false,
    governmentContracts: false,

    // Owner Information
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerJobTitle: '',
    additionalUsers: []
  });

  const steps = [
    { id: 1, title: 'Basic Info', titleAr: 'المعلومات الأساسية', icon: Building2 },
    { id: 2, title: 'Size & Structure', titleAr: 'الحجم والهيكل', icon: Users },
    { id: 3, title: 'Operations', titleAr: 'العمليات', icon: Shield },
    { id: 4, title: 'Technology', titleAr: 'التقنية', icon: Shield },
    { id: 5, title: 'Security', titleAr: 'الأمن', icon: Shield }
  ];

  const sectorOptions = [
    { value: 'banking', label: 'Banking & Finance', labelAr: 'الخدمات المصرفية والمالية' },
    { value: 'insurance', label: 'Insurance', labelAr: 'التأمين' },
    { value: 'healthcare', label: 'Healthcare', labelAr: 'الرعاية الصحية' },
    { value: 'ecommerce', label: 'E-commerce', labelAr: 'التجارة الإلكترونية' },
    { value: 'telecom', label: 'Telecommunications', labelAr: 'الاتصالات' },
    { value: 'government', label: 'Government', labelAr: 'القطاع الحكومي' },
    { value: 'education', label: 'Education', labelAr: 'التعليم' },
    { value: 'energy', label: 'Energy & Utilities', labelAr: 'الطاقة والمرافق' },
    { value: 'manufacturing', label: 'Manufacturing', labelAr: 'الصناعة' },
    { value: 'retail', label: 'Retail', labelAr: 'التجزئة' },
    { value: 'technology', label: 'Technology', labelAr: 'التقنية' },
    { value: 'other', label: 'Other', labelAr: 'أخرى' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.organizationName || !formData.sector || !formData.contactEmail) {
          setError('Please fill in all required fields');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
          setError('Please enter a valid email address');
          return false;
        }
        break;
      case 2:
        if (!formData.employeeCount || !formData.annualRevenueSar) {
          setError('Please provide employee count and annual revenue');
          return false;
        }
        break;
      case 3:
        if (formData.primaryBusinessActivities.length === 0) {
          setError('Please select at least one business activity');
          return false;
        }
        break;
      case 5:
        if (!formData.ownerName || !formData.ownerEmail) {
          setError('Please provide owner information');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
          setError('Please enter a valid owner email address');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          organizationName: formData.organizationName,
          organizationNameAr: formData.organizationNameAr,
          registrationNumber: formData.registrationNumber,
          sector: formData.sector,
          country: formData.country,
          city: formData.city,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,

          profile: {
            employee_count: parseInt(formData.employeeCount),
            annual_revenue_sar: parseFloat(formData.annualRevenueSar),
            market_cap_sar: formData.marketCapSar ? parseFloat(formData.marketCapSar) : null,
            organizational_structure: formData.organizationalStructure,
            number_of_branches: formData.numberOfBranches ? parseInt(formData.numberOfBranches) : null,
            international_presence: formData.internationalPresence,
            countries_operating_in: formData.countriesOperatingIn,

            primary_business_activities: formData.primaryBusinessActivities,
            secondary_activities: formData.secondaryActivities,
            business_model: formData.businessModel,
            customer_segments: formData.customerSegments,

            data_classification_level: formData.dataClassificationLevel,
            processes_pii: formData.processesPii,
            pii_volume: formData.piiVolume,
            processes_financial_data: formData.processesFinancialData,
            processes_health_data: formData.processesHealthData,
            data_residency_requirements: formData.dataResidencyRequirements,
            cross_border_data_transfer: formData.crossBorderDataTransfer,

            has_online_services: formData.hasOnlineServices,
            has_mobile_app: formData.hasMobileApp,
            has_api_integrations: formData.hasApiIntegrations,
            cloud_usage: formData.cloudUsage,
            cloud_providers: formData.cloudProviders,
            hosts_critical_infrastructure: formData.hostsCriticalInfrastructure,

            processes_payments: formData.processesPayments,
            payment_volume_daily: formData.paymentVolumDaily ? parseInt(formData.paymentVolumDaily) : null,
            payment_methods: formData.paymentMethods,
            accepts_international_payments: formData.acceptsInternationalPayments,
            currency_operations: formData.currencyOperations,

            current_security_maturity: formData.currentSecurityMaturity,
            existing_certifications: formData.existingCertifications,
            security_team_size: formData.securityTeamSize ? parseInt(formData.securityTeamSize) : null,
            dedicated_compliance_officer: formData.dedicatedComplianceOfficer,
            incident_response_plan: formData.incidentResponsePlan,

            risk_appetite: formData.riskAppetite,
            cyber_insurance: formData.cyberInsurance,
            number_of_vendors: formData.numberOfVendors ? parseInt(formData.numberOfVendors) : null,
            critical_vendors: formData.criticalVendors ? parseInt(formData.criticalVendors) : null,
            outsourced_services: formData.outsourcedServices,
            third_party_risk_mgmt: formData.thirdPartyRiskMgmt,

            total_customers: formData.totalCustomers ? parseInt(formData.totalCustomers) : null,
            active_users_monthly: formData.activeUsersMonthly ? parseInt(formData.activeUsersMonthly) : null,
            customer_types: formData.customerTypes,
            high_net_worth_clients: formData.highNetWorthClients,
            government_contracts: formData.governmentContracts
          },

          owner: {
            name: formData.ownerName,
            email: formData.ownerEmail,
            phone: formData.ownerPhone,
            jobTitle: formData.ownerJobTitle
          },

          additionalUsers: formData.additionalUsers
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Onboarding failed');
      }

      const result = await response.json();
      setOnboardingResult(result);

      // Show success modal for 3 seconds then navigate to dashboard
      setTimeout(() => {
        navigate(`/organizations/${result.organization.id}/dashboard`);
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              Basic Organization Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ABC Corporation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name (Arabic)
                </label>
                <input
                  type="text"
                  value={formData.organizationNameAr}
                  onChange={(e) => handleInputChange('organizationNameAr', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                  placeholder="شركة المثال"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => handleInputChange('sector', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Sector</option>
                  {sectorOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.labelAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+966 XX XXX XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Riyadh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Type
                </label>
                <input
                  type="text"
                  value={formData.licenseType}
                  onChange={(e) => handleInputChange('licenseType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Commercial License"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Street address, P.O. Box, etc."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Organization Size & Structure
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Count <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.employeeCount}
                  onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="150"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Revenue (SAR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.annualRevenueSar}
                  onChange={(e) => handleInputChange('annualRevenueSar', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Market Cap (SAR)
                </label>
                <input
                  type="number"
                  value={formData.marketCapSar}
                  onChange={(e) => handleInputChange('marketCapSar', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organizational Structure
                </label>
                <select
                  value={formData.organizationalStructure}
                  onChange={(e) => handleInputChange('organizationalStructure', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="single_entity">Single Entity</option>
                  <option value="group_holding">Group/Holding</option>
                  <option value="branch">Branch</option>
                  <option value="subsidiary">Subsidiary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Branches
                </label>
                <input
                  type="number"
                  value={formData.numberOfBranches}
                  onChange={(e) => handleInputChange('numberOfBranches', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.internationalPresence}
                  onChange={(e) => handleInputChange('internationalPresence', e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  International Presence
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Business Operations
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Primary Business Activities <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['banking', 'insurance', 'healthcare', 'ecommerce', 'data_processing', 'financial_services'].map(activity => (
                  <label key={activity} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50">
                    <input
                      type="checkbox"
                      checked={formData.primaryBusinessActivities.includes(activity)}
                      onChange={() => handleArrayToggle('primaryBusinessActivities', activity)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 capitalize">{activity.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Model
                </label>
                <select
                  value={formData.businessModel}
                  onChange={(e) => handleInputChange('businessModel', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="b2b">B2B</option>
                  <option value="b2c">B2C</option>
                  <option value="b2g">B2G</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Customers
                </label>
                <input
                  type="number"
                  value={formData.totalCustomers}
                  onChange={(e) => handleInputChange('totalCustomers', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10000"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Technology & Data Management
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Classification Level
                </label>
                <select
                  value={formData.dataClassificationLevel}
                  onChange={(e) => handleInputChange('dataClassificationLevel', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="top_secret">Top Secret</option>
                  <option value="secret">Secret</option>
                  <option value="confidential">Confidential</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cloud Usage
                </label>
                <select
                  value={formData.cloudUsage}
                  onChange={(e) => handleInputChange('cloudUsage', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="none">None</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="full_cloud">Full Cloud</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50">
                <input
                  type="checkbox"
                  checked={formData.processesPii}
                  onChange={(e) => handleInputChange('processesPii', e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Processes PII</span>
              </label>

              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50">
                <input
                  type="checkbox"
                  checked={formData.processesFinancialData}
                  onChange={(e) => handleInputChange('processesFinancialData', e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Financial Data</span>
              </label>

              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50">
                <input
                  type="checkbox"
                  checked={formData.hasOnlineServices}
                  onChange={(e) => handleInputChange('hasOnlineServices', e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Online Services</span>
              </label>

              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50">
                <input
                  type="checkbox"
                  checked={formData.hasMobileApp}
                  onChange={(e) => handleInputChange('hasMobileApp', e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Mobile App</span>
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Security & Owner Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Security Maturity
                </label>
                <select
                  value={formData.currentSecurityMaturity}
                  onChange={(e) => handleInputChange('currentSecurityMaturity', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="initial">Initial</option>
                  <option value="developing">Developing</option>
                  <option value="defined">Defined</option>
                  <option value="managed">Managed</option>
                  <option value="optimized">Optimized</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Appetite
                </label>
                <select
                  value={formData.riskAppetite}
                  onChange={(e) => handleInputChange('riskAppetite', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>

              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50">
                <input
                  type="checkbox"
                  checked={formData.processesPayments}
                  onChange={(e) => handleInputChange('processesPayments', e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Processes Payments</span>
              </label>

              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50">
                <input
                  type="checkbox"
                  checked={formData.dedicatedComplianceOfficer}
                  onChange={(e) => handleInputChange('dedicatedComplianceOfficer', e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Dedicated Compliance Officer</span>
              </label>
            </div>

            <div className="border-t pt-6 mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Owner Information</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.ownerPhone}
                    onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+966 XX XXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.ownerJobTitle}
                    onChange={(e) => handleInputChange('ownerJobTitle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Compliance Manager"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Success modal
  if (onboardingResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Onboarding Complete! 🎉
            </h2>

            <p className="text-gray-600 mb-6">
              Your organization has been successfully set up
            </p>

            <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Summary:</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Organization:</span>
                  <span className="font-medium">{onboardingResult.organization?.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Mandatory Frameworks:</span>
                  <span className="font-medium">{onboardingResult.applicability?.mandatoryFrameworks?.length || 0}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Total Controls:</span>
                  <span className="font-medium">{onboardingResult.summary?.totalControls || 0}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Assessments Created:</span>
                  <span className="font-medium">{onboardingResult.assessments?.length || 0}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tasks Seeded:</span>
                  <span className="font-medium">{onboardingResult.initialTasks?.length || 0}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Redirecting to dashboard in 3 seconds...
            </p>

            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Organization Onboarding
          </h1>
          <p className="text-gray-600">
            Complete AI-Powered Framework Selection & Assessment Generation
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`flex flex-col items-center ${currentStep >= step.id ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    currentStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{step.title}</span>
                  <span className="text-xs text-gray-500">{step.titleAr}</span>
                </div>

                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-md p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Complete Onboarding
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 text-center">
            <span className="font-semibold">AI-Powered Analysis:</span> Our system will automatically analyze your profile
            and select the most appropriate frameworks, generate assessments, assign them to the owner, and seed initial
            workflow tasks. Estimated time: <span className="font-semibold">5-15 seconds</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
