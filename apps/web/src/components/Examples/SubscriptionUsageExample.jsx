import React from 'react';
import ArabicTextEngine from '../Arabic/ArabicTextEngine';
import { AnimatedButton, AnimatedCard } from '../Animation/InteractiveAnimationToolkit';
import { FeatureGate, useSubscription } from '../Subscription/SubscriptionManager';

/**
 * Example showing how to use subscription features in your components
 */
const SubscriptionUsageExample = () => {
  const { hasFeature, currentPlan, checkUsageLimit } = useSubscription();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <ArabicTextEngine 
        animated={true}
        personalityType="professional"
        style={{ fontSize: '24px', textAlign: 'center', marginBottom: '30px' }}
      >
        أمثلة على استخدام نظام الاشتراك
      </ArabicTextEngine>

      {/* Example 1: Simple Feature Gate */}
      <AnimatedCard style={{ marginBottom: '20px' }}>
        <h3>مثال 1: حماية الميزات البسيطة</h3>
        
        <FeatureGate feature="aiScheduler" requiredPlan="professional">
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#e6fffa', 
            borderRadius: '8px',
            border: '1px solid #81e6d9'
          }}>
            <ArabicTextEngine personalityType="friendly">
              🤖 هذه ميزة الجدولة الذكية - متاحة للمشتركين في الخطة الاحترافية فما فوق!
            </ArabicTextEngine>
          </div>
        </FeatureGate>
      </AnimatedCard>

      {/* Example 2: Conditional Rendering */}
      <AnimatedCard style={{ marginBottom: '20px' }}>
        <h3>مثال 2: العرض المشروط</h3>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <AnimatedButton 
            variant="primary"
            culturalStyle="modern"
            disabled={!hasFeature('apiAccess')}
          >
            {hasFeature('apiAccess') ? '✅ API متاح' : '🔒 API مقفل'}
          </AnimatedButton>
          
          <AnimatedButton 
            variant="secondary"
            culturalStyle="traditional"
            disabled={!hasFeature('customBranding')}
          >
            {hasFeature('customBranding') ? '✅ العلامة التجارية' : '🔒 العلامة مقفلة'}
          </AnimatedButton>
          
          <AnimatedButton 
            variant="outline"
            culturalStyle="geometric"
            disabled={!hasFeature('ragSystem')}
          >
            {hasFeature('ragSystem') ? '✅ نظام RAG' : '🔒 RAG مقفل'}
          </AnimatedButton>
        </div>
      </AnimatedCard>

      {/* Example 3: Usage Limits */}
      <AnimatedCard style={{ marginBottom: '20px' }}>
        <h3>مثال 3: حدود الاستخدام</h3>
        
        <div style={{ display: 'grid', gap: '10px' }}>
          {['maxUsers', 'maxAssessments', 'storageGB'].map((limitType) => {
            const limit = checkUsageLimit(limitType);
            return (
              <div key={limitType} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: limit.allowed ? '#f0fff4' : '#fff5f5',
                borderRadius: '6px',
                border: `1px solid ${limit.allowed ? '#c6f6d5' : '#fed7d7'}`
              }}>
                <span>{limitType}</span>
                <span>
                  {limit.unlimited ? '∞' : `${limit.current}/${limit.limit}`}
                  {limit.allowed ? ' ✅' : ' ⚠️'}
                </span>
              </div>
            );
          })}
        </div>
      </AnimatedCard>

      {/* Example 4: Plan-specific Content */}
      <AnimatedCard>
        <h3>مثال 4: محتوى خاص بالخطة</h3>
        
        {currentPlan === 'free' && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#fed7d7', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <ArabicTextEngine personalityType="friendly">
              🆓 أنت تستخدم الخطة المجانية. ترقى للحصول على المزيد من الميزات!
            </ArabicTextEngine>
          </div>
        )}
        
        {currentPlan === 'professional' && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#bee3f8', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <ArabicTextEngine personalityType="friendly">
              💼 أنت تستخدم الخطة الاحترافية. لديك وصول للميزات المتقدمة!
            </ArabicTextEngine>
          </div>
        )}
        
        {currentPlan === 'enterprise' && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#c6f6d5', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <ArabicTextEngine personalityType="friendly">
              🏢 أنت تستخدم الخطة المؤسسية. لديك وصول لجميع الميزات!
            </ArabicTextEngine>
          </div>
        )}
      </AnimatedCard>

      {/* Code Examples */}
      <div style={{ marginTop: '30px' }}>
        <h3>أمثلة الكود / Code Examples:</h3>
        
        <div style={{ 
          backgroundColor: '#f7fafc', 
          padding: '15px', 
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
          marginBottom: '15px'
        }}>
          <strong>1. Feature Gate Usage:</strong><br/>
          <code style={{ color: '#2d3748' }}>
            &lt;FeatureGate feature="aiScheduler" requiredPlan="professional"&gt;<br/>
            &nbsp;&nbsp;&lt;YourAdvancedComponent /&gt;<br/>
            &lt;/FeatureGate&gt;
          </code>
        </div>

        <div style={{ 
          backgroundColor: '#f7fafc', 
          padding: '15px', 
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
          marginBottom: '15px'
        }}>
          <strong>2. Conditional Rendering:</strong><br/>
          <code style={{ color: '#2d3748' }}>
            const {'{'} hasFeature {'}'} = useSubscription();<br/>
            <br/>
            {'{'}hasFeature('apiAccess') && &lt;APIComponent /&gt;{'}'}
          </code>
        </div>

        <div style={{ 
          backgroundColor: '#f7fafc', 
          padding: '15px', 
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          <strong>3. Usage Limits:</strong><br/>
          <code style={{ color: '#2d3748' }}>
            const {'{'} checkUsageLimit {'}'} = useSubscription();<br/>
            const userLimit = checkUsageLimit('maxUsers');<br/>
            <br/>
            if (!userLimit.allowed) {'{'}<br/>
            &nbsp;&nbsp;// Show upgrade message<br/>
            {'}'}
          </code>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionUsageExample;
