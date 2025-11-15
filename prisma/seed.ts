// prisma/seed.ts - Database Seeding Script
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Seed Saudi Compliance Frameworks
  console.log('📋 Seeding Saudi compliance frameworks...')

  const frameworks = await Promise.all([
    prisma.compliance_frameworks.upsert({
      where: { code: 'NCA-ESSENTIAL' },
      update: {},
      create: {
        code: 'NCA-ESSENTIAL',
        name: 'NCA Essential Cybersecurity Controls',
        name_ar: 'متطلبات الأمن السيبراني الأساسية - الهيئة الوطنية للأمن السيبراني',
        description: 'Essential cybersecurity controls for Saudi organizations',
        description_ar: 'متطلبات الأمن السيبراني الأساسية للمنظمات السعودية',
        authority: 'NCA',
        country: 'Saudi Arabia',
        category: 'security',
        status: 'active',
        version: '2022'
      }
    }),

    prisma.compliance_frameworks.upsert({
      where: { code: 'SAMA-CSF' },
      update: {},
      create: {
        code: 'SAMA-CSF',
        name: 'SAMA Cybersecurity Framework',
        name_ar: 'إطار الأمن السيبراني - البنك المركزي السعودي',
        description: 'Cybersecurity framework for Saudi financial institutions',
        description_ar: 'إطار الأمن السيبراني للمؤسسات المالية السعودية',
        authority: 'SAMA',
        country: 'Saudi Arabia',
        category: 'security',
        status: 'active',
        version: '2021'
      }
    }),

    prisma.compliance_frameworks.upsert({
      where: { code: 'ISO27001' },
      update: {},
      create: {
        code: 'ISO27001',
        name: 'ISO 27001 Information Security',
        name_ar: 'أيزو 27001 أمن المعلومات',
        description: 'International information security management standard',
        description_ar: 'المعيار الدولي لإدارة أمن المعلومات',
        authority: 'ISO',
        country: 'Saudi Arabia',
        category: 'security',
        status: 'active',
        version: '2022'
      }
    })
  ])

  console.log(`✅ Created ${frameworks.length} compliance frameworks`)

  // Seed Sample Saudi Organizations
  console.log('🏢 Seeding sample Saudi organizations...')

  const organizations = await Promise.all([
    prisma.organizations.upsert({
      where: { id: 'sample-org-1' },
      update: {},
      create: {
        id: 'sample-org-1',
        name: 'Saudi Advanced Technology Company',
        name_ar: 'شركة التقنية المتقدمة السعودية',
        sector: 'technology',
        industry: 'Software Development',
        country: 'Saudi Arabia',
        city: 'Riyadh',
        contact_email: 'contact@satc.sa',
        cr_number: '1234567890',
        sdaia_license: 'SDAIA-2024-001',
        nca_certification: 'certified',
        compliance_score: 85.50,
        status: 'active'
      }
    }),

    prisma.organizations.upsert({
      where: { id: 'sample-org-2' },
      update: {},
      create: {
        id: 'sample-org-2',
        name: 'Gulf Financial Services',
        name_ar: 'خدمات الخليج المالية',
        sector: 'banking',
        industry: 'Financial Services',
        country: 'Saudi Arabia',
        city: 'Jeddah',
        contact_email: 'info@gfs.sa',
        cr_number: '9876543210',
        sama_relevant: true,
        compliance_score: 92.30,
        status: 'active'
      }
    })
  ])

  console.log(`✅ Created ${organizations.length} sample organizations`)

  // Seed Sample Users with Saudi permissions
  console.log('👥 Seeding sample users...')

  const users = await Promise.all([
    prisma.users.upsert({
      where: { email: 'admin@shahin.ai' },
      update: {},
      create: {
        email: 'admin@shahin.ai',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeXt6Uq.iR8JQPGGm', // password: Admin@123
        full_name: 'System Administrator',
        organization_id: 'sample-org-1',
        role: 'super_admin',
        can_access_sama_data: true,
        can_access_health_data: true,
        can_access_government_data: true,
        status: 'active'
      }
    }),

    prisma.users.upsert({
      where: { email: 'compliance@shahin.ai' },
      update: {},
      create: {
        email: 'compliance@shahin.ai',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeXt6Uq.iR8JQPGGm',
        full_name: 'Compliance Officer',
        organization_id: 'sample-org-1',
        role: 'compliance_officer',
        can_access_sama_data: true,
        can_access_health_data: false,
        can_access_government_data: true,
        status: 'active'
      }
    })
  ])

  console.log(`✅ Created ${users.length} sample users`)

  // Seed SAMA Compliance Tracking
  console.log('🏦 Seeding SAMA compliance tracking...')

  const samaCompliance = await prisma.sama_compliance.upsert({
    where: { organization_id: 'sample-org-2' },
    update: {},
    create: {
      organization_id: 'sample-org-2',
      sama_framework_version: '2021',
      overall_compliance_score: 88.50,
      critical_controls_compliant: 45,
      total_critical_controls: 52,
      cybersecurity_maturity_level: '4',
      incident_reporting_compliance: true,
      data_protection_compliance: true
    }
  })

  console.log('✅ Created SAMA compliance tracking')

  // Seed NCA Compliance Tracking
  console.log('🔒 Seeding NCA compliance tracking...')

  const ncaCompliance = await prisma.nca_compliance.upsert({
    where: { organization_id: 'sample-org-1' },
    update: {},
    create: {
      organization_id: 'sample-org-1',
      governance_compliance: 85.00,
      protection_compliance: 90.00,
      defense_compliance: 88.00,
      response_compliance: 82.00,
      recovery_compliance: 87.00,
      overall_maturity_level: 'managed',
      target_maturity_level: 'optimizing',
      nca_certified: true
    }
  })

  console.log('✅ Created NCA compliance tracking')

  console.log('')
  console.log('🎉 Database seeding completed successfully!')
  console.log('')
  console.log('📊 Summary:')
  console.log(`   • ${frameworks.length} compliance frameworks`)
  console.log(`   • ${organizations.length} sample organizations`)
  console.log(`   • ${users.length} sample users`)
  console.log('   • SAMA compliance tracking')
  console.log('   • NCA compliance tracking')
  console.log('')
  console.log('📝 Note: For full 5000+ controls, run:')
  console.log('   psql $RAW_DATABASE_URL < apps/web/src/enterprise/populate-complete-controls.sql')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
