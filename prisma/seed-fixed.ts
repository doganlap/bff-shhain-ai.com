// prisma/seed-fixed.ts - Fixed Database Seeding Script
// Using tables from schema.prisma (main schema)

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding with main schema...')

  try {
    // Seed Tenants (Organizations)
    console.log('🏢 Seeding tenants (Saudi organizations)...')

    const tenants = await Promise.all([
      prisma.tenants.upsert({
      where: { slug: 'saudi-advanced-tech' },
      update: {},
      create: {
        slug: 'saudi-advanced-tech',
        display_name: 'Saudi Advanced Technology Company',
        type: 'customer',
        status: 'active',
        country: 'Saudi Arabia',
        sector: 'technology'
      }
    }),

    prisma.tenants.upsert({
      where: { slug: 'gulf-financial' },
      update: {},
      create: {
        slug: 'gulf-financial',
        display_name: 'Gulf Financial Services',
        type: 'customer',
        status: 'active',
        country: 'Saudi Arabia',
        sector: 'banking'
      }
    })
  ])

  console.log(`✅ Created ${tenants.length} tenants`)

  // Seed Users
  console.log('👥 Seeding users...')

  const users = await Promise.all([
    prisma.users.upsert({
      where: { tenant_id_email: { tenant_id: tenants[0].id, email: 'admin@shahin.ai' } },
      update: {},
      create: {
        tenant_id: tenants[0].id,
        email: 'admin@shahin.ai',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeXt6Uq.iR8JQPGGm',
        full_name: 'System Administrator',
        role: 'super_admin',
        is_super_admin: true
      }
    }),

    prisma.users.upsert({
      where: { tenant_id_email: { tenant_id: tenants[0].id, email: 'compliance@shahin.ai' } },
      update: {},
      create: {
        tenant_id: tenants[0].id,
        email: 'compliance@shahin.ai',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeXt6Uq.iR8JQPGGm',
        full_name: 'Compliance Officer',
        role: 'compliance_officer'
      }
    }),

    prisma.users.upsert({
      where: { tenant_id_email: { tenant_id: tenants[1].id, email: 'admin@gfs.sa' } },
      update: {},
      create: {
        tenant_id: tenants[1].id,
        email: 'admin@gfs.sa',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeXt6Uq.iR8JQPGGm',
        full_name: 'Banking Administrator',
        role: 'admin'
      }
    })
  ])

  console.log(`✅ Created ${users.length} users`)

  // Seed Demo Requests (for compliance demo)
  console.log('📋 Seeding demo requests...')

  const demoRequests = await Promise.all([
    prisma.demo_requests.create({
      data: {
        email: 'demo@saudi-tech.sa',
        full_name: 'Demo User',
        company_name: 'Saudi Tech Solutions',
        sector: 'technology',
        org_size: '51-200',
        use_cases: ['compliance_management', 'risk_assessment'],
        status: 'approved_auto',
        tenant_id: tenants[0].id,
        user_id: users[0].id,
        metadata: {
          compliance_frameworks: ['NCA', 'ISO27001'],
          sdaia_license: 'SDAIA-2024-001',
          nca_certified: true
        }
      }
    }),

    prisma.demo_requests.create({
      data: {
        email: 'demo@gfs.sa',
        full_name: 'Banking Demo User',
        company_name: 'Gulf Financial Services',
        sector: 'banking',
        org_size: '201-500',
        use_cases: ['sama_compliance', 'cybersecurity'],
        status: 'approved_manual',
        tenant_id: tenants[1].id,
        user_id: users[2].id,
        metadata: {
          compliance_frameworks: ['SAMA', 'NCA'],
          sama_maturity_level: 4,
          incident_reporting: true
        }
      }
    })
  ])

  console.log(`✅ Created ${demoRequests.length} demo requests`)

  // Seed POC Requests
  console.log('🎯 Seeding POC requests...')

  const pocRequests = await Promise.all([
    prisma.poc_requests.create({
      data: {
        email: 'poc@saudi-tech.sa',
        full_name: 'POC Lead',
        company_name: 'Saudi Advanced Technology',
        sector: 'technology',
        use_cases: ['ai_compliance', 'automated_assessment'],
        environment_preference: 'azure-cloud',
        status: 'approved',
        tenant_id: tenants[0].id,
        owner_internal_user_id: users[0].id
      }
    })
  ])

  console.log(`✅ Created ${pocRequests.length} POC requests`)

  console.log('')
  console.log('🎉 Database seeding completed successfully!')
  console.log('')
  console.log('📊 Summary:')
  console.log(`   • ${tenants.length} tenants (Saudi organizations)`)
  console.log(`   • ${users.length} users with Saudi roles`)
  console.log(`   • ${demoRequests.length} demo requests for compliance`)
  console.log(`   • ${pocRequests.length} POC requests`)
  console.log('')
  console.log('🇸🇦 Saudi Compliance Data Ready:')
  console.log('   • NCA Cybersecurity framework data')
  console.log('   • SAMA Banking compliance data')
  console.log('   • Multi-tenant architecture')
  console.log('   • Demo and POC workflows')
  console.log('')
    console.log('💡 For full 5000+ enterprise controls, run:')
    console.log('   psql $RAW_DATABASE_URL < apps/web/src/enterprise/populate-complete-controls.sql')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
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
