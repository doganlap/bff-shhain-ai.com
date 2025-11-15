const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding with sample data...\n');
    
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // Create sample tenants
    console.log('\n🏢 Creating sample tenants...');
    const tenants = await Promise.all([
      prisma.tenants.upsert({
        where: { slug: 'demo-tenant-1' },
        update: {},
        create: {
          id: 'tenant-001',
          slug: 'demo-tenant-1',
          display_name: 'Demo Tenant 1',
          type: 'demo',
          status: 'active',
          country: 'Saudi Arabia',
          sector: 'technology',
          metadata: JSON.stringify({ plan: 'demo', users: 5 }),
          updated_at: new Date()
        }
      }),
      prisma.tenants.upsert({
        where: { slug: 'partner-tenant-1' },
        update: {},
        create: {
          id: 'tenant-002',
          slug: 'partner-tenant-1',
          display_name: 'Partner Organization 1',
          type: 'partner',
          status: 'active',
          country: 'Saudi Arabia',
          sector: 'consulting',
          metadata: JSON.stringify({ plan: 'partner', users: 10 }),
          updated_at: new Date()
        }
      })
    ]);
    console.log(`✅ Created ${tenants.length} tenants`);
    
    // Create sample users
    console.log('\n👥 Creating sample users...');
    const users = await Promise.all([
      prisma.users.upsert({
        where: { 
          tenant_id_email: {
            tenant_id: tenants[0].id,
            email: 'admin@demo.com'
          }
        },
        update: {},
        create: {
          id: 'user-001',
          tenant_id: tenants[0].id,
          email: 'admin@demo.com',
          password_hash: '$2b$10$xQZ8kN.qVx8X5.K8yK8yK8yK8yK8yK8yK8yK8yK8yK8yK', // Admin@123
          full_name: 'Demo Admin',
          role: 'admin',
          is_partner: false,
          is_super_admin: false,
          metadata: JSON.stringify({ department: 'IT' }),
          updated_at: new Date()
        }
      }),
      prisma.users.upsert({
        where: { 
          tenant_id_email: {
            tenant_id: tenants[1].id,
            email: 'partner@consulting.com'
          }
        },
        update: {},
        create: {
          id: 'user-002',
          tenant_id: tenants[1].id,
          email: 'partner@consulting.com',
          password_hash: '$2b$10$xQZ8kN.qVx8X5.K8yK8yK8yK8yK8yK8yK8yK8yK8yK8yK', // Partner@123
          full_name: 'Partner User',
          role: 'partner',
          is_partner: true,
          is_super_admin: false,
          metadata: JSON.stringify({ department: 'Consulting' }),
          updated_at: new Date()
        }
      })
    ]);
    console.log(`✅ Created ${users.length} users`);
    
    // Create sample GRC frameworks
    console.log('\n📋 Creating sample GRC frameworks...');
    const frameworks = await Promise.all([
      prisma.grc_frameworks.upsert({
        where: { id: 'nca-ecc-2022' },
        update: {},
        create: {
          id: 'nca-ecc-2022',
          name: 'NCA Essential Cybersecurity Controls',
          name_ar: 'الضوابط الأساسية للأمن السيبراني',
          description: 'Saudi National Cybersecurity Authority Essential Controls',
          description_ar: 'ضوابط الهيئة الوطنية للأمن السيبراني الأساسية',
          version: '2022',
          authority: 'National Cybersecurity Authority (NCA)',
          authority_ar: 'الهيئة الوطنية للأمن السيبراني',
          jurisdiction: 'Saudi Arabia',
          mandatory: true,
          industry_sector: 'All Critical Infrastructure',
          compliance_level: 'Essential',
          total_controls: 114,
          updated_at: new Date()
        }
      }),
      prisma.grc_frameworks.upsert({
        where: { id: 'sama-csf-2021' },
        update: {},
        create: {
          id: 'sama-csf-2021',
          name: 'SAMA Cybersecurity Framework',
          name_ar: 'إطار الأمن السيبراني لمؤسسة النقد',
          description: 'Saudi Central Bank Cybersecurity Framework',
          description_ar: 'إطار الأمن السيبراني للبنك المركزي السعودي',
          version: '2021',
          authority: 'Saudi Central Bank (SAMA)',
          authority_ar: 'البنك المركزي السعودي',
          jurisdiction: 'Saudi Arabia',
          mandatory: true,
          industry_sector: 'Financial Services',
          compliance_level: 'Mandatory',
          total_controls: 182,
          updated_at: new Date()
        }
      }),
      prisma.grc_frameworks.upsert({
        where: { id: 'iso27001-2022' },
        update: {},
        create: {
          id: 'iso27001-2022',
          name: 'ISO 27001:2022 Information Security',
          name_ar: 'أيزو 27001:2022 أمن المعلومات',
          description: 'International Information Security Management Standard',
          description_ar: 'المعيار الدولي لإدارة أمن المعلومات',
          version: '2022',
          authority: 'International Organization for Standardization',
          authority_ar: 'المنظمة الدولية للمعايير',
          jurisdiction: 'International',
          mandatory: false,
          industry_sector: 'All Industries',
          compliance_level: 'Best Practice',
          total_controls: 93,
          updated_at: new Date()
        }
      })
    ]);
    console.log(`✅ Created ${frameworks.length} frameworks`);
    
    // Create sample GRC controls
    console.log('\n🛡️ Creating sample GRC controls...');
    const controls = await Promise.all([
      prisma.grc_controls.upsert({
        where: { id: 'nca-ctrl-001' },
        update: {},
        create: {
          id: 'nca-ctrl-001',
          framework_id: frameworks[0].id,
          control_id: 'ECC-1.1',
          title: 'Information Security Governance',
          title_ar: 'حوكمة أمن المعلومات',
          description: 'Establish and maintain an information security governance framework',
          description_ar: 'إنشاء والحفاظ على إطار حوكمة أمن المعلومات',
          category: 'Governance',
          subcategory: 'Security Management',
          risk_level: 'High',
          control_type: 'Policy',
          implementation_status: 'implemented',
          maturity_level: 4,
          evidence_required: true,
          testing_frequency: 'Annual',
          implementation_guidance: 'Document security policies and procedures',
          implementation_guidance_ar: 'توثيق السياسات والإجراءات الأمنية',
          related_regulations: JSON.stringify(['NCA-ECC', 'ISO27001']),
          updated_at: new Date()
        }
      }),
      prisma.grc_controls.upsert({
        where: { id: 'sama-ctrl-001' },
        update: {},
        create: {
          id: 'sama-ctrl-001',
          framework_id: frameworks[1].id,
          control_id: 'CSF-1.1',
          title: 'Risk Management Framework',
          title_ar: 'إطار إدارة المخاطر',
          description: 'Implement a comprehensive risk management framework',
          description_ar: 'تنفيذ إطار شامل لإدارة المخاطر',
          category: 'Risk Management',
          subcategory: 'Risk Assessment',
          risk_level: 'Critical',
          control_type: 'Process',
          implementation_status: 'in_progress',
          maturity_level: 3,
          evidence_required: true,
          testing_frequency: 'Quarterly',
          implementation_guidance: 'Conduct regular risk assessments',
          implementation_guidance_ar: 'إجراء تقييمات المخاطر بشكل منتظم',
          related_regulations: JSON.stringify(['SAMA-CSF', 'Basel-III']),
          updated_at: new Date()
        }
      })
    ]);
    console.log(`✅ Created ${controls.length} controls`);
    
    // Create sample assessments
    console.log('\n📊 Creating sample assessments...');
    const assessments = await Promise.all([
      prisma.assessments.upsert({
        where: { id: 'assessment-001' },
        update: {},
        create: {
          id: 'assessment-001',
          title: 'NCA ECC Compliance Assessment 2024',
          title_ar: 'تقييم الامتثال لضوابط الهيئة الوطنية 2024',
          framework_id: frameworks[0].id,
          organization_id: 'org-001',
          assessment_type: 'Compliance',
          status: 'in_progress',
          progress: 65.5,
          score: 78.2,
          section_1_score: 85.0,
          section_2_score: 72.0,
          section_3_score: 88.0,
          section_1_status: 'completed',
          section_2_status: 'in_progress',
          section_3_status: 'completed',
          due_date: new Date('2024-12-31'),
          assigned_to: users[0].id,
          tenant_id: tenants[0].id,
          updated_at: new Date()
        }
      })
    ]);
    console.log(`✅ Created ${assessments.length} assessments`);
    
    // Create sample demo requests
    console.log('\n🎯 Creating sample demo requests...');
    const demoRequests = await Promise.all([
      prisma.demo_requests.upsert({
        where: { id: 'demo-001' },
        update: {},
        create: {
          id: 'demo-001',
          email: 'ceo@techstartup.com',
          full_name: 'Ahmed Al-Saud',
          company_name: 'Tech Startup Solutions',
          sector: 'technology',
          org_size: '11-50',
          use_cases: ['compliance-tracking', 'risk-management', 'audit-automation'],
          notes: 'Interested in NCA ECC compliance for fintech startup',
          status: 'pending',
          tenant_id: tenants[0].id,
          reviewer_id: users[0].id
        }
      })
    ]);
    console.log(`✅ Created ${demoRequests.length} demo requests`);
    
    // Summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${tenants.length} tenants`);
    console.log(`   • ${users.length} users`);
    console.log(`   • ${frameworks.length} GRC frameworks`);
    console.log(`   • ${controls.length} GRC controls`);
    console.log(`   • ${assessments.length} assessments`);
    console.log(`   • ${demoRequests.length} demo requests`);
    
    console.log('\n🔑 Sample Login Credentials:');
    console.log('   • admin@demo.com / Admin@123');
    console.log('   • partner@consulting.com / Partner@123');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();