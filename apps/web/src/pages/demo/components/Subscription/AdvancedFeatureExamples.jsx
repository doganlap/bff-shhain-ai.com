import React, { useState } from 'react';
import ArabicTextEngine from '../Arabic/ArabicTextEngine';
import { AnimatedButton, AnimatedCard, AnimatedProgress } from '../Animation/InteractiveAnimationToolkit';
import { FeatureGate, useSubscription } from './SubscriptionManager';

/**
 * Examples of Advanced Features with Subscription Gates
 * Shows how different features are locked/unlocked based on subscription level
 */
const AdvancedFeatureExamples = () => {
  const { hasFeature, currentPlan } = useSubscription();
  const [activeDemo, setActiveDemo] = useState('aiScheduler');

  const featureExamples = [
    {
      id: 'aiScheduler',
      name: 'الجدولة الذكية',
      nameEn: 'AI Scheduler',
      requiredPlan: 'professional',
      icon: '🤖',
      description: 'جدولة المهام تلقائياً باستخدام الذكاء الاصطناعي',
      descriptionEn: 'Automatically schedule tasks using AI'
    },
    {
      id: 'ragSystem',
      name: 'نظام RAG',
      nameEn: 'RAG System',
      requiredPlan: 'enterprise',
      icon: '📚',
      description: 'البحث الذكي في الوثائق والإجابة على الأسئلة',
      descriptionEn: 'Intelligent document search and Q&A'
    },
    {
      id: 'predictiveAnalytics',
      name: 'التحليلات التنبؤية',
      nameEn: 'Predictive Analytics',
      requiredPlan: 'professional',
      icon: '📊',
      description: 'توقع المخاطر والمشاكل المستقبلية',
      descriptionEn: 'Predict future risks and issues'
    },
    {
      id: 'culturalAdaptation',
      name: 'التكيف الثقافي',
      nameEn: 'Cultural Adaptation',
      requiredPlan: 'professional',
      icon: '🕌',
      description: 'واجهة مخصصة للثقافة العربية والإسلامية',
      descriptionEn: 'Arabic and Islamic cultural interface'
    },
    {
      id: 'customBranding',
      name: 'العلامة التجارية المخصصة',
      nameEn: 'Custom Branding',
      requiredPlan: 'enterprise',
      icon: '🎨',
      description: 'تخصيص الألوان والشعار حسب شركتك',
      descriptionEn: 'Customize colors and logo for your company'
    },
    {
      id: 'apiAccess',
      name: 'الوصول لـ API',
      nameEn: 'API Access',
      requiredPlan: 'professional',
      icon: '🔌',
      description: 'ربط النظام مع الأنظمة الأخرى',
      descriptionEn: 'Connect with other systems'
    }
  ];

  const renderAISchedulerDemo = () => (
    <FeatureGate feature="aiScheduler" requiredPlan="professional">
      <div style={{ padding: '20px' }}>
        <ArabicTextEngine 
          personalityType="professional"
          style={{ fontSize: '20px', marginBottom: '20px', textAlign: 'center' }}
        >
          🤖 الجدولة الذكية بالذكاء الاصطناعي
        </ArabicTextEngine>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px',
          marginBottom: '20px'
        }}>
          {[
            { task: 'مراجعة تقييم الأمان السيبراني', priority: 'عالية', ai: 'مجدولة لغداً 9:00 ص' },
            { task: 'تحديث سياسات الخصوصية', priority: 'متوسطة', ai: 'مجدولة لنهاية الأسبوع' },
            { task: 'تدريب الموظفين على الامتثال', priority: 'منخفضة', ai: 'مجدولة للأسبوع القادم' }
          ].map((item, index) => (
            <AnimatedCard key={index} hover3D={true}>
              <div style={{ marginBottom: '10px' }}>
                <ArabicTextEngine 
                  personalityType="casual"
                  style={{ fontSize: '14px', fontWeight: 'bold' }}
                >
                  {item.task}
                </ArabicTextEngine>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor: item.priority === 'عالية' ? '#fed7d7' : item.priority === 'متوسطة' ? '#feebc8' : '#c6f6d5',
                  color: item.priority === 'عالية' ? '#742a2a' : item.priority === 'متوسطة' ? '#7b341e' : '#22543d'
                }}>
                  {item.priority}
                </span>
              </div>
              <div style={{ 
                backgroundColor: '#e6fffa', 
                padding: '8px', 
                borderRadius: '4px',
                fontSize: '12px',
                color: '#234e52'
              }}>
                🤖 AI: {item.ai}
              </div>
            </AnimatedCard>
          ))}
        </div>

        <AnimatedButton variant="primary" culturalStyle="modern">
          إنشاء جدولة ذكية جديدة / Create New Smart Schedule
        </AnimatedButton>
      </div>
    </FeatureGate>
  );

  const renderRAGSystemDemo = () => (
    <FeatureGate feature="ragSystem" requiredPlan="enterprise">
      <div style={{ padding: '20px' }}>
        <ArabicTextEngine 
          personalityType="professional"
          style={{ fontSize: '20px', marginBottom: '20px', textAlign: 'center' }}
        >
          📚 نظام RAG للبحث الذكي في الوثائق
        </ArabicTextEngine>

        <div style={{ 
          backgroundColor: '#f7fafc', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <input 
            type="text"
            placeholder="اسأل أي سؤال عن وثائق الامتثال... / Ask any question about compliance documents..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ 
          backgroundColor: '#e6fffa', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <strong>🤖 AI Response:</strong>
          <ArabicTextEngine 
            personalityType="casual"
            style={{ fontSize: '14px', marginTop: '8px' }}
          >
            بناءً على وثائق الامتثال المتاحة، يجب مراجعة سياسات الأمان السيبراني كل 6 أشهر وفقاً للمعايير السعودية...
          </ArabicTextEngine>
        </div>

        <div style={{ fontSize: '12px', color: '#718096' }}>
          <strong>Sources:</strong> Cybersecurity Policy v2.1, Saudi Compliance Guidelines, Internal Audit Report Q3
        </div>
      </div>
    </FeatureGate>
  );

  const renderPredictiveAnalyticsDemo = () => (
    <FeatureGate feature="predictiveAnalytics" requiredPlan="professional">
      <div style={{ padding: '20px' }}>
        <ArabicTextEngine 
          personalityType="professional"
          style={{ fontSize: '20px', marginBottom: '20px', textAlign: 'center' }}
        >
          📊 التحليلات التنبؤية للمخاطر
        </ArabicTextEngine>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <AnimatedCard>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>⚠️</div>
              <ArabicTextEngine 
                personalityType="casual"
                style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}
              >
                مخاطر عالية متوقعة
              </ArabicTextEngine>
              <p style={{ fontSize: '12px', color: '#718096' }}>High Risk Predicted</p>
              <AnimatedProgress progress={85} color="danger" />
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>📈</div>
              <ArabicTextEngine 
                personalityType="casual"
                style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}
              >
                تحسن في الامتثال
              </ArabicTextEngine>
              <p style={{ fontSize: '12px', color: '#718096' }}>Compliance Improvement</p>
              <AnimatedProgress progress={72} color="success" />
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>🔍</div>
              <ArabicTextEngine 
                personalityType="casual"
                style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}
              >
                مراجعة مطلوبة
              </ArabicTextEngine>
              <p style={{ fontSize: '12px', color: '#718096' }}>Review Required</p>
              <AnimatedProgress progress={45} color="warning" />
            </div>
          </AnimatedCard>
        </div>

        <div style={{ 
          backgroundColor: '#fff5f5', 
          padding: '15px', 
          borderRadius: '8px',
          border: '1px solid #fed7d7'
        }}>
          <strong>🚨 تنبيه ذكي:</strong>
          <ArabicTextEngine 
            personalityType="casual"
            style={{ fontSize: '14px', marginTop: '8px' }}
          >
            النظام يتوقع زيادة في المخاطر السيبرانية بنسبة 23% خلال الشهر القادم. يُنصح بتحديث بروتوكولات الأمان.
          </ArabicTextEngine>
        </div>
      </div>
    </FeatureGate>
  );

  const renderCulturalAdaptationDemo = () => (
    <FeatureGate feature="culturalAdaptation" requiredPlan="professional">
      <div style={{ padding: '20px' }}>
        <ArabicTextEngine 
          personalityType="professional"
          style={{ fontSize: '20px', marginBottom: '20px', textAlign: 'center' }}
        >
          🕌 التكيف الثقافي والإسلامي
        </ArabicTextEngine>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px'
        }}>
          <AnimatedCard culturalPattern={true}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>📅</div>
              <ArabicTextEngine 
                personalityType="casual"
                style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}
              >
                التقويم الهجري
              </ArabicTextEngine>
              <div style={{ 
                backgroundColor: '#f7fafc', 
                padding: '10px', 
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                ١٥ جمادى الأولى ١٤٤٦هـ<br/>
                <span style={{ fontSize: '12px', color: '#718096' }}>
                  15 Jumada Al-Awwal 1446 H
                </span>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard culturalPattern={true}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>🕌</div>
              <ArabicTextEngine 
                personalityType="casual"
                style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}
              >
                أوقات الصلاة
              </ArabicTextEngine>
              <div style={{ fontSize: '12px', color: '#4a5568' }}>
                الفجر: ٥:٣٠<br/>
                الظهر: ١٢:١٥<br/>
                العصر: ٣:٤٥<br/>
                المغرب: ٦:٢٠<br/>
                العشاء: ٧:٤٥
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard culturalPattern={true}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>🎨</div>
              <ArabicTextEngine 
                personalityType="casual"
                style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}
              >
                الأنماط الهندسية
              </ArabicTextEngine>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                margin: '0 auto',
                backgroundColor: '#2D5016',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                ✦
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </FeatureGate>
  );

  const renderCustomBrandingDemo = () => (
    <FeatureGate feature="customBranding" requiredPlan="enterprise">
      <div style={{ padding: '20px' }}>
        <ArabicTextEngine 
          personalityType="professional"
          style={{ fontSize: '20px', marginBottom: '20px', textAlign: 'center' }}
        >
          🎨 العلامة التجارية المخصصة
        </ArabicTextEngine>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#667eea', 
            color: 'white', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🏢</div>
            <strong>شعار الشركة</strong><br/>
            <span style={{ fontSize: '12px' }}>Company Logo</span>
          </div>

          <div style={{ 
            padding: '15px', 
            backgroundColor: '#2D5016', 
            color: 'white', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🎨</div>
            <strong>الألوان المخصصة</strong><br/>
            <span style={{ fontSize: '12px' }}>Custom Colors</span>
          </div>

          <div style={{ 
            padding: '15px', 
            backgroundColor: '#48bb78', 
            color: 'white', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📝</div>
            <strong>خطوط مخصصة</strong><br/>
            <span style={{ fontSize: '12px' }}>Custom Fonts</span>
          </div>
        </div>
      </div>
    </FeatureGate>
  );

  const renderAPIAccessDemo = () => (
    <FeatureGate feature="apiAccess" requiredPlan="professional">
      <div style={{ padding: '20px' }}>
        <ArabicTextEngine 
          personalityType="professional"
          style={{ fontSize: '20px', marginBottom: '20px', textAlign: 'center' }}
        >
          🔌 الوصول لواجهة برمجة التطبيقات
        </ArabicTextEngine>

        <div style={{ 
          backgroundColor: '#f7fafc', 
          padding: '15px', 
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
          marginBottom: '15px'
        }}>
          <div style={{ color: '#2d3748', marginBottom: '10px' }}>
            <strong>API Endpoints Available:</strong>
          </div>
          <div style={{ color: '#4a5568' }}>
            GET /api/assessments<br/>
            POST /api/assessments<br/>
            GET /api/organizations<br/>
            POST /api/reports/generate<br/>
            GET /api/analytics/dashboard
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#e6fffa', 
          padding: '15px', 
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          <div style={{ color: '#2d3748', marginBottom: '10px' }}>
            <strong>Sample Request:</strong>
          </div>
          <div style={{ color: '#4a5568' }}>
            curl -H "Authorization: Bearer YOUR_TOKEN"<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;-H "X-Tenant-ID: your-tenant-id"<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;https://api.grc-system.com/api/assessments
          </div>
        </div>
      </div>
    </FeatureGate>
  );

  const renderFeatureDemo = () => {
    switch (activeDemo) {
      case 'aiScheduler': return renderAISchedulerDemo();
      case 'ragSystem': return renderRAGSystemDemo();
      case 'predictiveAnalytics': return renderPredictiveAnalyticsDemo();
      case 'culturalAdaptation': return renderCulturalAdaptationDemo();
      case 'customBranding': return renderCustomBrandingDemo();
      case 'apiAccess': return renderAPIAccessDemo();
      default: return renderAISchedulerDemo();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <ArabicTextEngine 
        animated={true}
        personalityType="professional"
        style={{ fontSize: '28px', textAlign: 'center', marginBottom: '20px' }}
      >
        الميزات المتقدمة حسب الاشتراك
      </ArabicTextEngine>

      <p style={{ 
        fontSize: '16px', 
        textAlign: 'center', 
        color: '#718096',
        marginBottom: '30px'
      }}>
        Advanced Features by Subscription Level
      </p>

      <div style={{ 
        backgroundColor: currentPlan === 'free' ? '#fed7d7' : currentPlan === 'professional' ? '#bee3f8' : '#c6f6d5',
        padding: '15px',
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <ArabicTextEngine 
          personalityType="friendly"
          style={{ fontSize: '16px', fontWeight: 'bold' }}
        >
          خطتك الحالية: {currentPlan === 'free' ? 'مجاني' : currentPlan === 'professional' ? 'احترافي' : 'مؤسسي'}
        </ArabicTextEngine>
        <p style={{ fontSize: '14px', margin: '5px 0 0 0', color: '#4a5568' }}>
          Current Plan: {currentPlan === 'free' ? 'Free' : currentPlan === 'professional' ? 'Professional' : 'Enterprise'}
        </p>
      </div>

      {/* Feature Navigation */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '10px',
        marginBottom: '30px'
      }}>
        {featureExamples.map((feature) => (
          <AnimatedButton
            key={feature.id}
            variant={activeDemo === feature.id ? 'primary' : 'outline'}
            size="small"
            culturalStyle="modern"
            onClick={() => setActiveDemo(feature.id)}
            disabled={!hasFeature(feature.id)}
            style={{
              opacity: hasFeature(feature.id) ? 1 : 0.6,
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '16px' }}>{feature.icon}</span>
              <span style={{ fontSize: '12px' }}>{feature.name}</span>
              {!hasFeature(feature.id) && (
                <span style={{ fontSize: '10px', opacity: 0.7 }}>🔒</span>
              )}
            </div>
          </AnimatedButton>
        ))}
      </div>

      {/* Feature Demo */}
      <AnimatedCard hover3D={true} culturalPattern={true}>
        {renderFeatureDemo()}
      </AnimatedCard>
    </div>
  );
};

export default AdvancedFeatureExamples;
