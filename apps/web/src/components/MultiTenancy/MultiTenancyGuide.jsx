import React, { useState } from 'react';
import ArabicTextEngine from '../Arabic/ArabicTextEngine';
import { AnimatedButton, AnimatedCard } from '../Animation/InteractiveAnimationToolkit';

const MultiTenancyGuide = () => {
  const [selectedTenant, setSelectedTenant] = useState('tenant1');
  const [currentView, setCurrentView] = useState('overview');

  // Sample tenant data
  const tenants = {
    tenant1: {
      id: 'tenant-001',
      name: 'شركة الرياض للتقنية',
      nameEn: 'Riyadh Tech Company',
      subdomain: 'riyadh-tech',
      users: 150,
      assessments: 25,
      organizations: 8,
      color: '#667eea'
    },
    tenant2: {
      id: 'tenant-002', 
      name: 'مجموعة جدة التجارية',
      nameEn: 'Jeddah Commercial Group',
      subdomain: 'jeddah-commercial',
      users: 89,
      assessments: 12,
      organizations: 5,
      color: '#48bb78'
    },
    tenant3: {
      id: 'tenant-003',
      name: 'بنك الخليج الإسلامي',
      nameEn: 'Gulf Islamic Bank',
      subdomain: 'gulf-islamic-bank',
      users: 320,
      assessments: 45,
      organizations: 15,
      color: '#ed8936'
    }
  };

  const architectureSteps = [
    {
      id: 1,
      title: 'عزل البيانات',
      titleEn: 'Data Isolation',
      description: 'كل مستأجر له بيانات منفصلة تماماً',
      descriptionEn: 'Each tenant has completely separate data',
      technical: 'tenant_id UUID in every table + Row Level Security (RLS)'
    },
    {
      id: 2,
      title: 'التحكم في الوصول',
      titleEn: 'Access Control',
      description: 'المستخدمون يرون بيانات مؤسستهم فقط',
      descriptionEn: 'Users only see their organization\'s data',
      technical: 'JWT tokens with tenant_id + middleware validation'
    },
    {
      id: 3,
      title: 'التخصيص المستقل',
      titleEn: 'Independent Customization',
      description: 'كل مستأجر يخصص النظام حسب احتياجاته',
      descriptionEn: 'Each tenant customizes system per their needs',
      technical: 'Tenant-specific settings, themes, and configurations'
    },
    {
      id: 4,
      title: 'الفوترة المنفصلة',
      titleEn: 'Separate Billing',
      description: 'فوترة مستقلة لكل مستأجر',
      descriptionEn: 'Independent billing for each tenant',
      technical: 'Usage tracking per tenant + quota management'
    }
  ];

  const renderOverview = () => (
    <div>
      <ArabicTextEngine 
        animated={true}
        personalityType="professional"
        style={{ fontSize: '24px', textAlign: 'center', marginBottom: '30px' }}
      >
        نظرة عامة على التعدد المستأجرين
      </ArabicTextEngine>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {Object.entries(tenants).map(([key, tenant]) => (
          <AnimatedCard 
            key={key}
            hover3D={true}
            culturalPattern={true}
            style={{ 
              cursor: 'pointer',
              border: selectedTenant === key ? `3px solid ${tenant.color}` : '1px solid #e2e8f0'
            }}
            onClick={() => setSelectedTenant(key)}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: tenant.color,
                margin: '0 auto 15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                {tenant.nameEn.charAt(0)}
              </div>
              
              <ArabicTextEngine 
                personalityType="friendly"
                style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}
              >
                {tenant.name}
              </ArabicTextEngine>
              
              <p style={{ fontSize: '14px', color: '#718096', marginBottom: '15px' }}>
                {tenant.nameEn}
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                fontSize: '12px'
              }}>
                <div>
                  <strong>{tenant.users}</strong><br/>
                  <span style={{ color: '#718096' }}>مستخدم / Users</span>
                </div>
                <div>
                  <strong>{tenant.assessments}</strong><br/>
                  <span style={{ color: '#718096' }}>تقييم / Assessments</span>
                </div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      <AnimatedCard>
        <ArabicTextEngine 
          personalityType="professional"
          style={{ fontSize: '20px', marginBottom: '20px', textAlign: 'center' }}
        >
          كيف يعمل النظام متعدد المستأجرين؟
        </ArabicTextEngine>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {architectureSteps.map((step) => (
            <div key={step.id} style={{
              padding: '20px',
              backgroundColor: '#f7fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#667eea',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}>
                {step.id}
              </div>
              
              <ArabicTextEngine 
                personalityType="professional"
                style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}
              >
                {step.title}
              </ArabicTextEngine>
              
              <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '10px' }}>
                {step.titleEn}
              </p>
              
              <ArabicTextEngine 
                personalityType="casual"
                style={{ fontSize: '14px', marginBottom: '10px' }}
              >
                {step.description}
              </ArabicTextEngine>
              
              <p style={{ fontSize: '12px', color: '#718096' }}>
                {step.descriptionEn}
              </p>
              
              <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#edf2f7',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#2d3748'
              }}>
                {step.technical}
              </div>
            </div>
          ))}
        </div>
      </AnimatedCard>
    </div>
  );

  const renderTechnical = () => (
    <div>
      <ArabicTextEngine 
        animated={true}
        personalityType="professional"
        style={{ fontSize: '24px', textAlign: 'center', marginBottom: '30px' }}
      >
        التفاصيل التقنية للتعدد المستأجرين
      </ArabicTextEngine>

      <div style={{ display: 'grid', gap: '20px' }}>
        {/* Database Level */}
        <AnimatedCard>
          <h3 style={{ color: '#667eea', marginBottom: '15px' }}>
            🗄️ مستوى قاعدة البيانات / Database Level
          </h3>
          
          <div style={{ 
            backgroundColor: '#f7fafc', 
            padding: '15px', 
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            marginBottom: '15px'
          }}>
            <div style={{ color: '#2d3748', marginBottom: '10px' }}>
              <strong>Every table has tenant_id:</strong>
            </div>
            <div style={{ color: '#4a5568' }}>
              CREATE TABLE assessments (<br/>
              &nbsp;&nbsp;id UUID PRIMARY KEY,<br/>
              &nbsp;&nbsp;<span style={{ backgroundColor: '#fef5e7', padding: '2px 4px' }}>tenant_id UUID NOT NULL</span>,<br/>
              &nbsp;&nbsp;name VARCHAR(255),<br/>
              &nbsp;&nbsp;...<br/>
              );
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
              <strong>Row Level Security (RLS):</strong>
            </div>
            <div style={{ color: '#4a5568' }}>
              CREATE POLICY tenant_isolation_policy<br/>
              ON assessments<br/>
              USING (<span style={{ backgroundColor: '#fef5e7', padding: '2px 4px' }}>tenant_id = current_setting('app.tenant_id')::uuid</span>);
            </div>
          </div>
        </AnimatedCard>

        {/* Application Level */}
        <AnimatedCard>
          <h3 style={{ color: '#48bb78', marginBottom: '15px' }}>
            ⚙️ مستوى التطبيق / Application Level
          </h3>
          
          <div style={{ 
            backgroundColor: '#f0fff4', 
            padding: '15px', 
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            marginBottom: '15px'
          }}>
            <div style={{ color: '#2d3748', marginBottom: '10px' }}>
              <strong>Middleware Validation:</strong>
            </div>
            <div style={{ color: '#4a5568' }}>
              const validateTenant = (req, res, next) =&gt; {'{'}
              <br/>&nbsp;&nbsp;const tenantId = req.headers['x-tenant-id'];
              <br/>&nbsp;&nbsp;if (!tenantId) return res.status(400).json({'{'}error: 'Tenant required'{'}'});
              <br/>&nbsp;&nbsp;req.tenantId = tenantId;
              <br/>&nbsp;&nbsp;next();
              <br/>{'}'};
            </div>
          </div>

          <div style={{ 
            backgroundColor: '#f7fafc', 
            padding: '15px', 
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            <div style={{ color: '#2d3748', marginBottom: '10px' }}>
              <strong>API Queries with Tenant Filter:</strong>
            </div>
            <div style={{ color: '#4a5568' }}>
              SELECT * FROM assessments<br/>
              WHERE <span style={{ backgroundColor: '#fef5e7', padding: '2px 4px' }}>tenant_id = $1</span><br/>
              AND status = 'active';
            </div>
          </div>
        </AnimatedCard>

        {/* Frontend Level */}
        <AnimatedCard>
          <h3 style={{ color: '#ed8936', marginBottom: '15px' }}>
            🌐 مستوى الواجهة الأمامية / Frontend Level
          </h3>
          
          <div style={{ 
            backgroundColor: '#fffaf0', 
            padding: '15px', 
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            <div style={{ color: '#2d3748', marginBottom: '10px' }}>
              <strong>Tenant Context in React:</strong>
            </div>
            <div style={{ color: '#4a5568' }}>
              const TenantProvider = ({'{'}children{'}'}) =&gt; {'{'}
              <br/>&nbsp;&nbsp;const [tenantId] = useState(localStorage.getItem('tenantId'));
              <br/>&nbsp;&nbsp;
              <br/>&nbsp;&nbsp;// All API calls include tenant header
              <br/>&nbsp;&nbsp;axios.defaults.headers['X-Tenant-ID'] = tenantId;
              <br/>&nbsp;&nbsp;
              <br/>&nbsp;&nbsp;return (
              <br/>&nbsp;&nbsp;&nbsp;&nbsp;&lt;TenantContext.Provider value={'{'}tenantId{'}'}&gt;
              <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'{'}children{'}'}
              <br/>&nbsp;&nbsp;&nbsp;&nbsp;&lt;/TenantContext.Provider&gt;
              <br/>&nbsp;&nbsp;);
              <br/>{'}'};
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );

  const renderUserFlow = () => (
    <div>
      <ArabicTextEngine 
        animated={true}
        personalityType="professional"
        style={{ fontSize: '24px', textAlign: 'center', marginBottom: '30px' }}
      >
        تدفق المستخدم في النظام متعدد المستأجرين
      </ArabicTextEngine>

      <div style={{ display: 'grid', gap: '20px' }}>
        {[
          {
            step: 1,
            title: 'تحديد المستأجر',
            titleEn: 'Tenant Identification',
            description: 'النظام يحدد المستأجر من النطاق الفرعي أو رمز الشركة',
            flow: 'user.riyadh-tech.grc-system.com → tenant_id: riyadh-tech'
          },
          {
            step: 2,
            title: 'تسجيل الدخول',
            titleEn: 'Authentication',
            description: 'المستخدم يسجل دخوله بحساب خاص بمؤسسته',
            flow: 'Login → JWT token with tenant_id + user_id'
          },
          {
            step: 3,
            title: 'تحميل البيانات',
            titleEn: 'Data Loading',
            description: 'النظام يحمل البيانات الخاصة بالمستأجر فقط',
            flow: 'All queries filtered by tenant_id automatically'
          },
          {
            step: 4,
            title: 'العمل المعزول',
            titleEn: 'Isolated Operations',
            description: 'جميع العمليات محصورة في نطاق المستأجر',
            flow: 'Create/Read/Update/Delete → Always scoped to tenant'
          }
        ].map((item) => (
          <AnimatedCard key={item.step} hover3D={true}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: '#667eea',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '18px',
                flexShrink: 0
              }}>
                {item.step}
              </div>
              
              <div style={{ flex: 1 }}>
                <ArabicTextEngine 
                  personalityType="professional"
                  style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}
                >
                  {item.title}
                </ArabicTextEngine>
                
                <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '10px' }}>
                  {item.titleEn}
                </p>
                
                <ArabicTextEngine 
                  personalityType="casual"
                  style={{ fontSize: '14px', marginBottom: '15px' }}
                >
                  {item.description}
                </ArabicTextEngine>
                
                <div style={{
                  backgroundColor: '#edf2f7',
                  padding: '10px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#2d3748'
                }}>
                  {item.flow}
                </div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <ArabicTextEngine 
        animated={true} 
        personalityType="professional"
        style={{ 
          fontSize: '32px', 
          textAlign: 'center', 
          marginBottom: '20px',
          color: '#2d3748'
        }}
      >
        النظام متعدد المستأجرين
      </ArabicTextEngine>

      <p style={{ 
        fontSize: '16px', 
        textAlign: 'center', 
        color: '#718096',
        marginBottom: '40px'
      }}>
        Multi-Tenant GRC System Architecture
      </p>

      {/* Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '15px',
        marginBottom: '40px'
      }}>
        {[
          { key: 'overview', label: 'نظرة عامة', labelEn: 'Overview' },
          { key: 'technical', label: 'تقني', labelEn: 'Technical' },
          { key: 'userflow', label: 'تدفق المستخدم', labelEn: 'User Flow' }
        ].map((tab) => (
          <AnimatedButton
            key={tab.key}
            variant={currentView === tab.key ? 'primary' : 'outline'}
            culturalStyle="modern"
            onClick={() => setCurrentView(tab.key)}
          >
            <span style={{ marginRight: '8px' }}>{tab.label}</span>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>({tab.labelEn})</span>
          </AnimatedButton>
        ))}
      </div>

      {/* Content */}
      <div>
        {currentView === 'overview' && renderOverview()}
        {currentView === 'technical' && renderTechnical()}
        {currentView === 'userflow' && renderUserFlow()}
      </div>
    </div>
  );
};

export default MultiTenancyGuide;
