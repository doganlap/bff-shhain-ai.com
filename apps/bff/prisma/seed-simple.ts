// prisma/seed-simple.ts - Simple Database Seeding Script
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Seed Frameworks
  console.log('📋 Seeding compliance frameworks...')

  const frameworks = await Promise.all([
    prisma.framework.upsert({
      where: { id: 'framework-nca-essential' },
      update: {},
      create: {
        id: 'framework-nca-essential',
        name: 'NCA Essential Cybersecurity Controls',
        description: 'Essential cybersecurity controls for Saudi organizations',
        category: 'security',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),

    prisma.framework.upsert({
      where: { id: 'framework-iso27001' },
      update: {},
      create: {
        id: 'framework-iso27001',
        name: 'ISO 27001 Information Security',
        description: 'International information security management standard',
        category: 'security',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),

    prisma.framework.upsert({
      where: { id: 'framework-sama-csf' },
      update: {},
      create: {
        id: 'framework-sama-csf',
        name: 'SAMA Cybersecurity Framework',
        description: 'Cybersecurity framework for Saudi financial institutions',
        category: 'security',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  ])

  console.log(`✅ Created ${frameworks.length} frameworks`)

  // Seed Organizations
  console.log('🏢 Seeding organizations...')

  const organizations = await Promise.all([
    prisma.organization.upsert({
      where: { id: 'org-demo-001' },
      update: {},
      create: {
        id: 'org-demo-001',
        name: 'Demo Organization',
        tenantId: 'tenant-demo-001',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  ])

  console.log(`✅ Created ${organizations.length} organizations`)

  // Seed Users
  console.log('👥 Seeding users...')

  const users = await Promise.all([
    prisma.user.upsert({
      where: { id: 'user-admin-001' },
      update: {},
      create: {
        id: 'user-admin-001',
        email: 'admin@demo.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeXt6Uq.iR8JQPGGm', // password: Admin@123
        organizationId: 'org-demo-001',
        updatedAt: new Date()
      }
    })
  ])

  console.log(`✅ Created ${users.length} users`)

  // Seed Controls
  console.log('🎛️ Seeding controls...')
  
  const controls = await Promise.all([
    prisma.control.upsert({
      where: { id: 'ctrl-nca-gov-01' },
      update: {},
      create: {
        id: 'ctrl-nca-gov-01',
        controlId: 'GOV-1',
        description: 'Cybersecurity governance structure and accountability',
        family: 'Governance',
        frameworkId: 'framework-nca-essential',
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
        frameworkId: 'framework-nca-essential',
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
        frameworkId: 'framework-iso27001',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.control.upsert({
      where: { id: 'ctrl-iso-crypto-01' },
      update: {},
      create: {
        id: 'ctrl-iso-crypto-01',
        controlId: 'A.10.1.1',
        description: 'Policy on the use of cryptographic controls',
        family: 'Cryptography',
        frameworkId: 'framework-iso27001',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  ])

  console.log(`✅ Created ${controls.length} controls`)

  // Seed Risks
  console.log('⚠️ Seeding risks...')
  
  const risks = await Promise.all([
    prisma.risk.upsert({
      where: { id: 'risk-001' },
      update: {},
      create: {
        id: 'risk-001',
        title: 'Unauthorized Data Access',
        description: 'Risk of unauthorized personnel accessing sensitive customer data',
        category: 'Information Security',
        status: 'Identified',
        likelihood: 3,
        impact: 4,
        organizationId: 'org-demo-001',
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
        status: 'Identified',
        likelihood: 2,
        impact: 5,
        organizationId: 'org-demo-001',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.risk.upsert({
      where: { id: 'risk-003' },
      update: {},
      create: {
        id: 'risk-003',
        title: 'Data Breach',
        description: 'Risk of sensitive data exposure due to weak access controls',
        category: 'Data Protection',
        status: 'Identified',
        likelihood: 3,
        impact: 5,
        organizationId: 'org-demo-001',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  ])

  console.log(`✅ Created ${risks.length} risks`)

  // Seed Assessments
  console.log('📝 Seeding assessments...')
  
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
        createdAt: new Date(),
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
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.assessment.upsert({
      where: { id: 'assess-003' },
      update: {},
      create: {
        id: 'assess-003',
        status: 'Pending',
        result: null,
        controlId: 'ctrl-iso-ac-01',
        riskId: 'risk-003',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  ])

  console.log(`✅ Created ${assessments.length} assessments`)

  console.log('')
  console.log('🎉 Database seeding completed successfully!')
  console.log('')
  console.log('📊 Summary:')
  console.log(`   • ${frameworks.length} compliance frameworks`)
  console.log(`   • ${organizations.length} organizations`)
  console.log(`   • ${users.length} users`)
  console.log(`   • ${controls.length} controls`)
  console.log(`   • ${risks.length} risks`)
  console.log(`   • ${assessments.length} assessments`)
  console.log('')
  console.log('✨ Your database is now populated with sample GRC data!')
  console.log('   The BFF will now return data instead of empty arrays.')
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
