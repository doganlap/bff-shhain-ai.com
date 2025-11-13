import React, { useState } from 'react';
import ArabicTextEngine from '../Arabic/ArabicTextEngine';
import { AnimatedButton, AnimatedCard } from '../Animation/InteractiveAnimationToolkit';

const UserFlowGuide = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const userSteps = [
    {
      id: 1,
      title: 'دخول النظام',
      titleEn: 'System Entry',
      description: 'المستخدم يدخل إلى النظام ويرى الواجهة العربية',
      descriptionEn: 'User enters system and sees Arabic interface',
      actions: ['تسجيل الدخول', 'اختيار اللغة', 'تخصيص الواجهة'],
      actionsEn: ['Login', 'Select Language', 'Customize Interface']
    },
    {
      id: 2,
      title: 'لوحة التحكم الرئيسية',
      titleEn: 'Main Dashboard',
      description: 'عرض شامل للحالة الحالية والإحصائيات',
      descriptionEn: 'Comprehensive overview of current status and statistics',
      actions: ['عرض الإحصائيات', 'التنبيهات', 'المهام المعلقة'],
      actionsEn: ['View Statistics', 'Notifications', 'Pending Tasks']
    },
    {
      id: 3,
      title: 'إدارة التقييمات',
      titleEn: 'Assessment Management',
      description: 'إنشاء وإدارة تقييمات الامتثال والمخاطر',
      descriptionEn: 'Create and manage compliance and risk assessments',
      actions: ['إنشاء تقييم جديد', 'مراجعة التقييمات', 'تتبع التقدم'],
      actionsEn: ['Create New Assessment', 'Review Assessments', 'Track Progress']
    },
    {
      id: 4,
      title: 'إدارة المؤسسات',
      titleEn: 'Organization Management',
      description: 'إدارة بيانات المؤسسات والهيكل التنظيمي',
      descriptionEn: 'Manage organization data and structure',
      actions: ['إضافة مؤسسة', 'تحديث البيانات', 'إدارة الأقسام'],
      actionsEn: ['Add Organization', 'Update Data', 'Manage Departments']
    },
    {
      id: 5,
      title: 'التقارير والتحليلات',
      titleEn: 'Reports & Analytics',
      description: 'إنتاج التقارير وتحليل البيانات',
      descriptionEn: 'Generate reports and analyze data',
      actions: ['إنشاء تقرير', 'تحليل المخاطر', 'تصدير البيانات'],
      actionsEn: ['Create Report', 'Risk Analysis', 'Export Data']
    },
    {
      id: 6,
      title: 'الإعدادات والتخصيص',
      titleEn: 'Settings & Customization',
      description: 'تخصيص النظام حسب احتياجات المستخدم',
      descriptionEn: 'Customize system according to user needs',
      actions: ['إعدادات الحساب', 'تفضيلات اللغة', 'إعدادات الإشعارات'],
      actionsEn: ['Account Settings', 'Language Preferences', 'Notification Settings']
    }
  ];

  const currentStepData = userSteps.find(step => step.id === currentStep);

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1000px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <ArabicTextEngine 
        animated={true} 
        personalityType="professional"
        style={{ 
          fontSize: '28px', 
          textAlign: 'center', 
          marginBottom: '30px',
          color: '#2d3748'
        }}
      >
        رحلة المستخدم في نظام الحوكمة والمخاطر والامتثال
      </ArabicTextEngine>

      {/* Progress Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '40px',
        padding: '0 20px'
      }}>
        {userSteps.map((step) => (
          <div 
            key={step.id}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => setCurrentStep(step.id)}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: currentStep >= step.id ? '#667eea' : '#e2e8f0',
              color: currentStep >= step.id ? 'white' : '#a0aec0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              marginBottom: '8px',
              transition: 'all 0.3s ease'
            }}>
              {step.id}
            </div>
            <span style={{ 
              fontSize: '12px', 
              textAlign: 'center',
              color: currentStep === step.id ? '#667eea' : '#4a5568',
              fontWeight: currentStep === step.id ? 'bold' : 'normal'
            }}>
              {step.titleEn}
            </span>
          </div>
        ))}
      </div>

      {/* Current Step Details */}
      <AnimatedCard hover3D={true} culturalPattern={true}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <ArabicTextEngine 
            animated={true} 
            personalityType="friendly"
            style={{ fontSize: '24px', color: '#667eea', marginBottom: '10px' }}
          >
            {currentStepData.title}
          </ArabicTextEngine>
          <p style={{ fontSize: '18px', color: '#4a5568', margin: 0 }}>
            {currentStepData.titleEn}
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <ArabicTextEngine 
            personalityType="professional"
            style={{ 
              fontSize: '16px', 
              lineHeight: '1.6', 
              textAlign: 'center',
              marginBottom: '10px'
            }}
          >
            {currentStepData.description}
          </ArabicTextEngine>
          <p style={{ 
            fontSize: '14px', 
            color: '#718096', 
            textAlign: 'center',
            margin: 0
          }}>
            {currentStepData.descriptionEn}
          </p>
        </div>

        {/* Actions */}
        <div>
          <h4 style={{ 
            textAlign: 'center', 
            color: '#2d3748', 
            marginBottom: '20px' 
          }}>
            الإجراءات المتاحة / Available Actions
          </h4>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {currentStepData.actions.map((action, index) => (
              <div key={index} style={{
                padding: '15px',
                backgroundColor: '#f7fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <ArabicTextEngine 
                  personalityType="friendly"
                  style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    color: '#2d3748',
                    marginBottom: '5px'
                  }}
                >
                  {action}
                </ArabicTextEngine>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#718096', 
                  margin: 0 
                }}>
                  {currentStepData.actionsEn[index]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '30px' 
        }}>
          <AnimatedButton
            variant="outline"
            culturalStyle="modern"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            ← السابق / Previous
          </AnimatedButton>
          
          <AnimatedButton
            variant="primary"
            culturalStyle="traditional"
            onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
            disabled={currentStep === 6}
          >
            التالي / Next →
          </AnimatedButton>
        </div>
      </AnimatedCard>

      {/* Technical Features */}
      <div style={{ marginTop: '40px' }}>
        <ArabicTextEngine 
          animated={true}
          personalityType="professional"
          style={{ 
            fontSize: '20px', 
            textAlign: 'center', 
            marginBottom: '20px',
            color: '#2d3748'
          }}
        >
          الميزات التقنية المتقدمة / Advanced Technical Features
        </ArabicTextEngine>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {[
            {
              icon: '🔤',
              title: 'محرك النصوص العربية',
              titleEn: 'Arabic Text Engine',
              features: ['RTL Support', 'Typography', 'Voice Synthesis', 'Animations']
            },
            {
              icon: '✨',
              title: 'الحركات التفاعلية',
              titleEn: 'Interactive Animations',
              features: ['Micro-interactions', '3D Effects', 'Cultural Patterns', 'Performance Optimized']
            },
            {
              icon: '🕌',
              title: 'التكيف الثقافي',
              titleEn: 'Cultural Adaptation',
              features: ['Prayer Times', 'Hijri Calendar', 'Islamic Patterns', 'Cultural Colors']
            },
            {
              icon: '🧠',
              title: 'الذكاء الاصطناعي',
              titleEn: 'AI Personalization',
              features: ['Behavior Learning', 'Smart Recommendations', 'Auto Customization', 'Predictive Analytics']
            }
          ].map((feature, index) => (
            <AnimatedCard key={index} hover3D={true}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>
                  {feature.icon}
                </div>
                <ArabicTextEngine 
                  personalityType="professional"
                  style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    marginBottom: '5px'
                  }}
                >
                  {feature.title}
                </ArabicTextEngine>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#718096', 
                  marginBottom: '15px' 
                }}>
                  {feature.titleEn}
                </p>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0 
                }}>
                  {feature.features.map((feat, idx) => (
                    <li key={idx} style={{ 
                      fontSize: '12px', 
                      color: '#4a5568',
                      marginBottom: '5px',
                      padding: '3px 8px',
                      backgroundColor: '#f7fafc',
                      borderRadius: '4px',
                      margin: '3px 0'
                    }}>
                      ✓ {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserFlowGuide;
