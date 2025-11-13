/**
 * Upgrade Page (Upsell/Upgrade Flow)
 * License upgrade and plan comparison
 */

import React, { useState, useEffect } from 'react';
import { 
  Check, X, Star, TrendingUp, Shield, Users, 
  HardDrive, Activity, ArrowRight, Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';
import licensesApi from '../../services/licensesApi';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../components/theme/ThemeProvider';

export default function UpgradePage() {
  const { t, isRTL } = useI18n();
  const { isDark } = useTheme();
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('annual');

  useEffect(() => {
    loadLicenses();
  }, []);

  const loadLicenses = async () => {
    try {
      setLoading(true);
      const data = await licensesApi.getAllLicenses({ is_active: 'true' });
      setLicenses(data.data || []);
    } catch (error) {
      console.error('Error loading licenses:', error);
      toast.error('Failed to load license plans');
    } finally {
      setLoading(false);
    }
  };

  const planFeatures = {
    starter: [
      { text: 'Up to 10 users', included: true },
      { text: '3 compliance frameworks', included: true },
      { text: '20 assessments/month', included: true },
      { text: '5 GB storage', included: true },
      { text: '10,000 API calls/month', included: true },
      { text: 'Email support', included: true },
      { text: 'Advanced analytics', included: false },
      { text: 'Custom integrations', included: false },
      { text: '24/7 support', included: false },
    ],
    professional: [
      { text: 'Up to 50 users', included: true },
      { text: '10 compliance frameworks', included: true },
      { text: '100 assessments/month', included: true },
      { text: '50 GB storage', included: true },
      { text: '100,000 API calls/month', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'API access', included: true },
      { text: 'Custom integrations', included: false },
      { text: '24/7 support', included: false },
    ],
    enterprise: [
      { text: 'Unlimited users', included: true },
      { text: 'Unlimited frameworks', included: true },
      { text: 'Unlimited assessments', included: true },
      { text: '500 GB storage', included: true },
      { text: '1M+ API calls/month', included: true },
      { text: '24/7 phone support', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated CSM', included: true },
      { text: 'Custom SLA', included: true },
    ],
  };

  const getPlanColor = (category) => {
    switch (category) {
      case 'starter': return 'blue';
      case 'professional': return 'purple';
      case 'enterprise': return 'amber';
      default: return 'gray';
    }
  };

  const calculateMonthlyPrice = (license) => {
    if (billingCycle === 'annual') {
      return license.price_annual / 12;
    }
    return license.price_monthly;
  };

  const calculateSavings = (license) => {
    const monthlyTotal = license.price_monthly * 12;
    const annualPrice = license.price_annual;
    return monthlyTotal - annualPrice;
  };

  const handleUpgrade = (license) => {
    setSelectedPlan(license);
    toast.success(`Selected ${license.name} plan`);
    // TODO: Implement upgrade flow
  };

  return (
    <div className={`min-h-screen ${isDark() ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Upgrade Your Plan</span>
        </div>
        <h1 className={`text-4xl font-bold mb-4 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
          Choose the Right Plan for Your Team
        </h1>
        <p className={`text-xl ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
          Scale your GRC operations with confidence
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="max-w-7xl mx-auto mb-8 flex justify-center">
        <div className={`inline-flex rounded-lg border ${isDark() ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'} p-1`}>
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              billingCycle === 'annual'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Annual
            <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {licenses.map((license) => {
            const color = getPlanColor(license.category);
            const isPopular = license.category === 'professional';
            const features = planFeatures[license.category] || [];

            return (
              <div
                key={license.id}
                className={`relative rounded-2xl shadow-lg ${
                  isDark() ? 'bg-gray-800' : 'bg-white'
                } ${isPopular ? 'ring-2 ring-purple-600' : ''}`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="inline-flex items-center gap-1 px-4 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name */}
                  <div className="mb-6">
                    <h3 className={`text-2xl font-bold mb-2 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                      {license.name}
                    </h3>
                    <p className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                      {license.description}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                        ${calculateMonthlyPrice(license).toFixed(0)}
                      </span>
                      <span className={`text-lg ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                        /month
                      </span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        Save ${calculateSavings(license).toFixed(0)}/year
                      </p>
                    )}
                    {license.trial_days > 0 && (
                      <p className={`text-sm mt-2 ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                        {license.trial_days}-day free trial
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(license)}
                    className={`w-full px-6 py-3 rounded-lg font-medium transition-colors mb-6 ${
                      isPopular
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : `bg-${color}-600 text-white hover:bg-${color}-700`
                    }`}
                  >
                    {selectedPlan?.id === license.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" />
                        Selected
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Upgrade to {license.name}
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </button>

                  {/* Features List */}
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${
                          feature.included
                            ? isDark() ? 'text-gray-300' : 'text-gray-700'
                            : isDark() ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FAQ Section */}
      <div className={`max-w-4xl mx-auto mt-16 rounded-lg shadow-md p-8 ${isDark() ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold mb-6 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className={`font-bold mb-2 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              Can I upgrade or downgrade anytime?
            </h3>
            <p className={isDark() ? 'text-gray-400' : 'text-gray-600'}>
              Yes, you can change your plan at any time. Changes take effect immediately, and we'll prorate the cost.
            </p>
          </div>
          <div>
            <h3 className={`font-bold mb-2 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              What happens to my data if I downgrade?
            </h3>
            <p className={isDark() ? 'text-gray-400' : 'text-gray-600'}>
              Your data is always safe. If you exceed limits after downgrading, you'll have read-only access until you upgrade again or reduce usage.
            </p>
          </div>
          <div>
            <h3 className={`font-bold mb-2 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              Do you offer custom enterprise plans?
            </h3>
            <p className={isDark() ? 'text-gray-400' : 'text-gray-600'}>
              Yes! Contact our sales team for custom pricing, features, and service level agreements tailored to your needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
