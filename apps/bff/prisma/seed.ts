// prisma/seed.ts - Database Seeding Script
import { PrismaClient } from '@prisma/client'

const url = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL
if (url) process.env.DATABASE_URL = url

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Seed Saudi Compliance Frameworks
  console.log('📋 Seeding Saudi compliance frameworks...')

  const frameworks = await Promise.all([
    prisma.framework.upsert({
      where: { id: 'NCA-ESSENTIAL' },
      update: {},
      create: {
        id: 'NCA-ESSENTIAL',
        name: 'NCA Essential Cybersecurity Controls',
        description: 'Essential cybersecurity controls for Saudi organizations',
        category: 'security'
      }
    }),

    prisma.framework.upsert({
      where: { id: 'SAMA-CSF' },
      update: {},
      create: {
        id: 'SAMA-CSF',
        name: 'SAMA Cybersecurity Framework',
        description: 'Cybersecurity framework for Saudi financial institutions',
        category: 'security'
      }
    }),

    prisma.framework.upsert({
      where: { id: 'ISO27001' },
      update: {},
      create: {
        id: 'ISO27001',
        name: 'ISO 27001 Information Security',
        description: 'International information security management standard',
        category: 'security'
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

  // Seed Sample Controls for NCA-ESSENTIAL Framework
  console.log('🎛️ Seeding sample controls...')
  
  const controls = await Promise.all([
    prisma.control.upsert({
      where: { id: 'ctrl-nca-gov-01' },
      update: {},
      create: {
        id: 'ctrl-nca-gov-01',
        controlId: 'GOV-1',
        description: 'Cybersecurity governance structure and accountability',
        family: 'Governance',
        frameworkId: frameworks[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.control.upsert({
      where: { id: 'ctrl-nca-prot-01' },
      update: {},
      create: {
        id: 'ctrl-nca-prot-01',
        controlId: 'PROT-1',
        description: 'Asset management and data classification',
        family: 'Protection',
        frameworkId: frameworks[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.control.upsert({
      where: { id: 'ctrl-iso-ac-01' },
      update: {},
      create: {
        id: 'ctrl-iso-ac-01',
        controlId: 'A.9.1.1',
        description: 'Access control policy',
        family: 'Access Control',
        frameworkId: frameworks[2].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  ])

  console.log(`✅ Created ${controls.length} sample controls`)

  // Seed Sample Risks
  console.log('⚠️ Seeding sample risks...')
  
  const risks = await Promise.all([
    prisma.risk.upsert({
      where: { id: 'risk-001' },
      update: {},
      create: {
        id: 'risk-001',
        title: 'Unauthorized Data Access',
        description: 'Risk of unauthorized personnel accessing sensitive customer data',
        category: 'Information Security',
        status: 'Active',
        likelihood: 3,
        impact: 4,
        organizationId: 'sample-org-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.risk.upsert({
      where: { id: 'risk-002' },
      update: {},
      create: {
        id: 'risk-002',
        title: 'Ransomware Attack',
        description: 'Potential ransomware attack targeting critical systems',
        category: 'Cybersecurity',
        status: 'Active',
        likelihood: 2,
        impact: 5,
        organizationId: 'sample-org-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  ])

  console.log(`✅ Created ${risks.length} sample risks`)

  // Seed Sample Assessments
  console.log('📝 Seeding sample assessments...')
  
  const assessments = await Promise.all([
    prisma.assessment.upsert({
      where: { id: 'assess-001' },
      update: {},
      create: {
        id: 'assess-001',
        status: 'Completed',
        result: 'Compliant',
        controlId: 'ctrl-nca-gov-01',
        riskId: 'risk-001',
        updatedAt: new Date()
      }
    }),
    prisma.assessment.upsert({
      where: { id: 'assess-002' },
      update: {},
      create: {
        id: 'assess-002',
        status: 'In Progress',
        result: null,
        controlId: 'ctrl-nca-prot-01',
        riskId: 'risk-002',
        updatedAt: new Date()
      }
    })
  ])

  console.log(`✅ Created ${assessments.length} sample assessments`)

  console.log('')
  console.log('🎉 Database seeding completed successfully!')
  console.log('')
  console.log('📊 Summary:')
  console.log(`   • ${frameworks.length} compliance frameworks`)
  console.log(`   • ${organizations.length} sample organizations`)
  console.log(`   • ${users.length} sample users`)
  console.log(`   • ${controls.length} sample controls`)
  console.log(`   • ${risks.length} sample risks`)
  console.log(`   • ${assessments.length} sample assessments`)
  console.log('   • SAMA compliance tracking')
  console.log('   • NCA compliance tracking')
  console.log('')
  console.log('🔐 Default Login Credentials:')
  console.log('   Email: admin@shahin.ai')
  console.log('   Password: Admin@123')
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
