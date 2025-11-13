import React, { useState, useEffect, createContext, useContext } from 'react';
import ArabicTextEngine from '../Arabic/ArabicTextEngine';
import { AnimatedButton, AnimatedCard } from '../Animation/InteractiveAnimationToolkit';

/**
 * Subscription Context for managing user subscription levels and feature access
 */
const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// Subscription Plans Configuration
const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'مجاني',
    nameEn: 'Free',
    price: 0,
    currency: 'SAR',
    features: {
      // Basic Features
      basicAssessments: true,
      basicReports: true,
      userLimit: 5,
      assessmentLimit: 10,
      storageLimit: 1, // GB

      // Advanced Features (Disabled)
      aiScheduler: false,
      ragSystem: false,
      predictiveAnalytics: false,
      culturalAdaptation: false,
      advancedAnimations: false,
      multiLanguage: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      advancedIntegrations: false,
      bulkOperations: false,
      advancedSecurity: false,
      auditTrails: false,
      customWorkflows: false,
      realTimeNotifications: false
    },
    limitations: {
      maxUsers: 5,
      maxAssessments: 10,
      maxOrganizations: 1,
      storageGB: 1,
      apiCallsPerMonth: 0,
      supportLevel: 'community'
    }
  },

  professional: {
    id: 'professional',
    name: 'احترافي',
    nameEn: 'Professional',
    price: 299,
    currency: 'SAR',
    features: {
      // Basic Features
      basicAssessments: true,
      basicReports: true,
      userLimit: 50,
      assessmentLimit: 100,
      storageLimit: 10, // GB

      // Advanced Features (Some Enabled)
      aiScheduler: true,
      ragSystem: false,
      predictiveAnalytics: true,
      culturalAdaptation: true,
      advancedAnimations: true,
      multiLanguage: true,
      customBranding: false,
      apiAccess: true,
      prioritySupport: false,
      advancedIntegrations: false,
      bulkOperations: true,
      advancedSecurity: true,
      auditTrails: true,
      customWorkflows: false,
      realTimeNotifications: true
    },
    limitations: {
      maxUsers: 50,
      maxAssessments: 100,
      maxOrganizations: 5,
      storageGB: 10,
      apiCallsPerMonth: 10000,
      supportLevel: 'email'
    }
  },

  enterprise: {
    id: 'enterprise',
    name: 'مؤسسي',
    nameEn: 'Enterprise',
    price: 899,
    currency: 'SAR',
    features: {
      // All Features Enabled
      basicAssessments: true,
      basicReports: true,
      userLimit: -1, // Unlimited
      assessmentLimit: -1, // Unlimited
      storageLimit: -1, // Unlimited

      // Advanced Features (All Enabled)
      aiScheduler: true,
      ragSystem: true,
      predictiveAnalytics: true,
      culturalAdaptation: true,
      advancedAnimations: true,
      multiLanguage: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      advancedIntegrations: true,
      bulkOperations: true,
      advancedSecurity: true,
      auditTrails: true,
      customWorkflows: true,
      realTimeNotifications: true
    },
    limitations: {
      maxUsers: -1, // Unlimited
      maxAssessments: -1, // Unlimited
      maxOrganizations: -1, // Unlimited
      storageGB: -1, // Unlimited
      apiCallsPerMonth: -1, // Unlimited
      supportLevel: 'priority'
    }
  }
};

// Feature Access Control Component
export const FeatureGate = ({
  feature,
  children,
  fallback = null,
  showUpgrade = true,
  requiredPlan = 'professional'
}) => {
  const { hasFeature, currentPlan, upgradePlan } = useSubscription();

  if (hasFeature(feature)) {
    return children;
  }

  if (showUpgrade) {
    return (
      <div style={{
        padding: '20px',
        border: '2px dashed #e2e8f0',
        borderRadius: '8px',
        textAlign: 'center',
        backgroundColor: '#f7fafc'
      }}>
        <div style={{ fontSize: '40px', marginBottom: '15px' }}>🔒</div>

        <ArabicTextEngine
          personalityType="professional"
          style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}
        >
          ميزة متقدمة - ترقية مطلوبة
        </ArabicTextEngine>

        <p style={{ fontSize: '14px', color: '#718096', marginBottom: '20px' }}>
          Advanced Feature - Upgrade Required
        </p>

        <AnimatedButton
          variant="primary"
          culturalStyle="modern"
          onClick={() => upgradePlan(requiredPlan)}
        >
          ترقية إلى {SUBSCRIPTION_PLANS[requiredPlan].name} / Upgrade to {SUBSCRIPTION_PLANS[requiredPlan].nameEn}
        </AnimatedButton>
      </div>
    );
  }

  return fallback;
};

// Subscription Provider Component
export const SubscriptionProvider = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState('free'); // Default to free plan
  const [usage, setUsage] = useState({
    users: 2,
    assessments: 5,
    organizations: 1,
    storageUsedGB: 0.5,
    apiCallsThisMonth: 150
  });

  // Load subscription data from API/localStorage
  useEffect(() => {
    const loadSubscriptionData = async () => {
      try {
        // Set default organization ID if not exists
        if (!localStorage.getItem('organizationId')) {
          localStorage.setItem('organizationId', '1');
        }

        // Try to load from API first, fallback to localStorage
        try {
          const organizationId = localStorage.getItem('organizationId') || '1';
          const subscriptionResponse = await fetch(`http://localhost:3000/api/subscriptions?organization_id=${organizationId}`);

          if (subscriptionResponse.ok) {
            const data = await subscriptionResponse.json();
            if (data.success && data.data.length > 0) {
              const subscription = data.data[0];
              setCurrentPlan(subscription.plan_name);
              setUsage({
                users: subscription.current_users || 0,
                assessments: subscription.current_usage?.assessments_created?.value || 0,
                organizations: 1,
                storageUsedGB: subscription.current_usage?.storage_used?.value || 0.5,
                apiCallsThisMonth: subscription.current_usage?.api_calls?.value || 150
              });
              return; // Successfully loaded from API
            }
          }
        } catch (apiError) {
          console.warn('Could not load subscription from API, falling back to localStorage:', apiError);
        }

        // Fallback to localStorage
        const savedPlan = localStorage.getItem('subscriptionPlan') || 'free';
        const savedUsage = JSON.parse(localStorage.getItem('subscriptionUsage') || '{}');

        setCurrentPlan(savedPlan);
        setUsage(prev => ({ ...prev, ...savedUsage }));
      } catch (error) {
        console.error('Error loading subscription data:', error);
      }
    };

    loadSubscriptionData();
  }, []);

  // Check if user has access to a specific feature
  const hasFeature = (featureName) => {
    const plan = SUBSCRIPTION_PLANS[currentPlan];
    return plan?.features[featureName] || false;
  };

  // Check usage limits
  const checkUsageLimit = (limitType) => {
    const plan = SUBSCRIPTION_PLANS[currentPlan];
    const limit = plan?.limitations[limitType];
    const currentUsage = usage[limitType] || 0;

    if (limit === -1) return { allowed: true, unlimited: true };

    return {
      allowed: currentUsage < limit,
      current: currentUsage,
      limit: limit,
      percentage: (currentUsage / limit) * 100
    };
  };

  // Upgrade plan function
  const upgradePlan = (newPlan) => {
    // In real app, this would redirect to payment page
    console.log(`Upgrading to ${newPlan} plan`);
    // For demo, we'll just update the plan
    setCurrentPlan(newPlan);
    localStorage.setItem('subscriptionPlan', newPlan);
  };

  // Get plan details
  const getPlanDetails = (planId = currentPlan) => {
    return SUBSCRIPTION_PLANS[planId];
  };

  const contextValue = {
    currentPlan,
    usage,
    hasFeature,
    checkUsageLimit,
    upgradePlan,
    getPlanDetails,
    plans: SUBSCRIPTION_PLANS
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Subscription Dashboard Component
const SubscriptionDashboard = () => {
  const { currentPlan, usage, checkUsageLimit, upgradePlan, getPlanDetails, plans } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);

  const currentPlanDetails = getPlanDetails();

  const usageLimits = [
    { key: 'maxUsers', label: 'المستخدمون', labelEn: 'Users', current: usage.users },
    { key: 'maxAssessments', label: 'التقييمات', labelEn: 'Assessments', current: usage.assessments },
    { key: 'maxOrganizations', label: 'المؤسسات', labelEn: 'Organizations', current: usage.organizations },
    { key: 'storageGB', label: 'التخزين (جيجا)', labelEn: 'Storage (GB)', current: usage.storageUsedGB },
    { key: 'apiCallsPerMonth', label: 'استدعاءات API', labelEn: 'API Calls', current: usage.apiCallsThisMonth }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <ArabicTextEngine
        animated={true}
        personalityType="professional"
        style={{ fontSize: '28px', textAlign: 'center', marginBottom: '30px' }}
      >
        إدارة الاشتراك والميزات المتقدمة
      </ArabicTextEngine>

      {/* Current Plan Status */}
      <AnimatedCard hover3D={true} culturalPattern={true} style={{ marginBottom: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: currentPlan === 'free' ? '#718096' : currentPlan === 'professional' ? '#667eea' : '#48bb78',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {currentPlan === 'free' ? '🆓' : currentPlan === 'professional' ? '💼' : '🏢'}
          </div>

          <ArabicTextEngine
            personalityType="friendly"
            style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}
          >
            الخطة الحالية: {currentPlanDetails.name}
          </ArabicTextEngine>

          <p style={{ fontSize: '16px', color: '#718096', marginBottom: '10px' }}>
            Current Plan: {currentPlanDetails.nameEn}
          </p>

          {currentPlanDetails.price > 0 && (
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2d3748' }}>
              {currentPlanDetails.price} {currentPlanDetails.currency} / شهرياً
            </p>
          )}
        </div>

        {/* Usage Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          {usageLimits.map((item) => {
            const limitCheck = checkUsageLimit(item.key);
            return (
              <div key={item.key} style={{
                padding: '15px',
                backgroundColor: '#f7fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <ArabicTextEngine
                  personalityType="casual"
                  style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}
                >
                  {item.label}
                </ArabicTextEngine>

                <p style={{ fontSize: '12px', color: '#718096', marginBottom: '10px' }}>
                  {item.labelEn}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3748' }}>
                    {item.current}
                  </span>
                  <span style={{ color: '#718096' }}>
                    / {limitCheck.unlimited ? '∞' : limitCheck.limit}
                  </span>
                </div>

                {!limitCheck.unlimited && (
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '3px',
                    marginTop: '8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(limitCheck.percentage, 100)}%`,
                      height: '100%',
                      backgroundColor: limitCheck.percentage > 80 ? '#f56565' : limitCheck.percentage > 60 ? '#ed8936' : '#48bb78',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AnimatedCard>

      {/* Available Plans */}
      <ArabicTextEngine
        personalityType="professional"
        style={{ fontSize: '24px', textAlign: 'center', marginBottom: '20px' }}
      >
        الخطط المتاحة / Available Plans
      </ArabicTextEngine>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {Object.entries(plans).map(([planId, plan]) => (
          <AnimatedCard
            key={planId}
            hover3D={true}
            style={{
              border: currentPlan === planId ? '3px solid #667eea' : '1px solid #e2e8f0',
              position: 'relative'
            }}
          >
            {currentPlan === planId && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '20px',
                backgroundColor: '#667eea',
                color: 'white',
                padding: '5px 15px',
                borderRadius: '15px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                الحالية / Current
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                {planId === 'free' ? '🆓' : planId === 'professional' ? '💼' : '🏢'}
              </div>

              <ArabicTextEngine
                personalityType="professional"
                style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}
              >
                {plan.name}
              </ArabicTextEngine>

              <p style={{ fontSize: '16px', color: '#718096', marginBottom: '15px' }}>
                {plan.nameEn}
              </p>

              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748' }}>
                {plan.price === 0 ? 'مجاناً' : `${plan.price} ${plan.currency}`}
                {plan.price > 0 && (
                  <span style={{ fontSize: '14px', color: '#718096' }}> / شهرياً</span>
                )}
              </div>
            </div>

            {/* Feature List */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '15px', color: '#2d3748' }}>الميزات / Features:</h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                {Object.entries(plan.features).slice(0, 8).map(([feature, enabled]) => (
                  <div key={feature} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: enabled ? '#2d3748' : '#a0aec0'
                  }}>
                    <span>{enabled ? '✅' : '❌'}</span>
                    <span style={{ textDecoration: enabled ? 'none' : 'line-through' }}>
                      {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {currentPlan !== planId && (
              <AnimatedButton
                variant="primary"
                culturalStyle="modern"
                onClick={() => upgradePlan(planId)}
                style={{ width: '100%' }}
              >
                {plan.price === 0 ? 'التبديل للمجاني' : `ترقية إلى ${plan.name}`}
              </AnimatedButton>
            )}
          </AnimatedCard>
        ))}
      </div>

      {/* Feature Comparison */}
      <AnimatedCard>
        <ArabicTextEngine
          personalityType="professional"
          style={{ fontSize: '20px', textAlign: 'center', marginBottom: '20px' }}
        >
          مقارنة الميزات المتقدمة / Advanced Features Comparison
        </ArabicTextEngine>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f7fafc' }}>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                  الميزة / Feature
                </th>
                {Object.entries(plans).map(([planId, plan]) => (
                  <th key={planId} style={{
                    padding: '12px',
                    textAlign: 'center',
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: currentPlan === planId ? '#edf2f7' : 'transparent'
                  }}>
                    {plan.name}<br/>
                    <span style={{ fontSize: '12px', color: '#718096' }}>({plan.nameEn})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'aiScheduler', label: 'جدولة ذكية بالذكاء الاصطناعي', labelEn: 'AI Smart Scheduling' },
                { key: 'ragSystem', label: 'نظام RAG للوثائق', labelEn: 'RAG Document System' },
                { key: 'predictiveAnalytics', label: 'التحليلات التنبؤية', labelEn: 'Predictive Analytics' },
                { key: 'culturalAdaptation', label: 'التكيف الثقافي', labelEn: 'Cultural Adaptation' },
                { key: 'advancedAnimations', label: 'الحركات المتقدمة', labelEn: 'Advanced Animations' },
                { key: 'customBranding', label: 'العلامة التجارية المخصصة', labelEn: 'Custom Branding' },
                { key: 'apiAccess', label: 'الوصول لـ API', labelEn: 'API Access' },
                { key: 'prioritySupport', label: 'الدعم المتقدم', labelEn: 'Priority Support' }
              ].map((feature) => (
                <tr key={feature.key}>
                  <td style={{
                    padding: '12px',
                    borderBottom: '1px solid #e2e8f0',
                    fontWeight: 'bold'
                  }}>
                    <ArabicTextEngine personalityType="casual" style={{ fontSize: '14px' }}>
                      {feature.label}
                    </ArabicTextEngine>
                    <br/>
                    <span style={{ fontSize: '12px', color: '#718096' }}>
                      {feature.labelEn}
                    </span>
                  </td>
                  {Object.entries(plans).map(([planId, plan]) => (
                    <td key={planId} style={{
                      padding: '12px',
                      textAlign: 'center',
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: currentPlan === planId ? '#f7fafc' : 'transparent'
                    }}>
                      <span style={{ fontSize: '20px' }}>
                        {plan.features[feature.key] ? '✅' : '❌'}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default SubscriptionDashboard;
