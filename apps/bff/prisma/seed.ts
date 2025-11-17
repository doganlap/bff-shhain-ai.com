import { PrismaClient } from '@prisma/client'

const url = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL
if (url) process.env.DATABASE_URL = url

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting minimal database seeding...')

  const org1 = await prisma.organization.upsert({
    where: { id: 'org-ksa-1' },
    update: { name: 'Saudi Tech Co', updatedAt: new Date() },
    create: {
      id: 'org-ksa-1',
      name: 'Saudi Tech Co',
      tenantId: '00000000-0000-0000-0000-000000000000',
      updatedAt: new Date()
    }
  })

  const nca = await prisma.framework.upsert({
    where: { id: 'NCA-ESSENTIAL' },
    update: { updatedAt: new Date(), organizationId: org1.id },
    create: {
      id: 'NCA-ESSENTIAL',
      name: 'NCA Essential Cybersecurity Controls',
      description: 'Essential cybersecurity controls',
      category: 'security',
      updatedAt: new Date(),
      organizationId: org1.id
    }
  })

  const iso = await prisma.framework.upsert({
    where: { id: 'ISO27001' },
    update: { updatedAt: new Date(), organizationId: org1.id },
    create: {
      id: 'ISO27001',
      name: 'ISO 27001 Information Security',
      description: 'International ISMS standard',
      category: 'security',
      updatedAt: new Date(),
      organizationId: org1.id
    }
  })

  await prisma.control.upsert({
    where: { id: 'ctrl-nca-gov-01' },
    update: { updatedAt: new Date() },
    create: {
      id: 'ctrl-nca-gov-01',
      controlId: 'GOV-1',
      description: 'Cybersecurity governance structure',
      family: 'Governance',
      frameworkId: nca.id,
      updatedAt: new Date()
    }
  })

  await prisma.control.upsert({
    where: { id: 'ctrl-iso-ac-01' },
    update: { updatedAt: new Date() },
    create: {
      id: 'ctrl-iso-ac-01',
      controlId: 'A.9.1.1',
      description: 'Access control policy',
      family: 'Access Control',
      frameworkId: iso.id,
      updatedAt: new Date()
    }
  })

  await prisma.user.upsert({
    where: { email: 'admin@local.dev' },
    update: { role: 'ADMIN', updatedAt: new Date(), organizationId: org1.id },
    create: {
      id: 'user-admin-1',
      email: 'admin@local.dev',
      name: 'Local Admin',
      password: 'Admin@123',
      role: 'ADMIN',
      updatedAt: new Date(),
      organizationId: org1.id
    }
  })

  const risk1 = await prisma.risk.upsert({
    where: { id: 'risk-001' },
    update: { updatedAt: new Date() },
    create: {
      id: 'risk-001',
      title: 'Unauthorized Data Access',
      description: 'Sensitive data exposure risk',
      category: 'Information Security',
      status: 'Active',
      likelihood: 3,
      impact: 4,
      organizationId: org1.id,
      updatedAt: new Date()
    }
  })

  const risk2 = await prisma.risk.upsert({
    where: { id: 'risk-002' },
    update: { updatedAt: new Date() },
    create: {
      id: 'risk-002',
      title: 'Ransomware Attack',
      description: 'Potential ransomware targeting core systems',
      category: 'Cybersecurity',
      status: 'Active',
      likelihood: 2,
      impact: 5,
      organizationId: org1.id,
      updatedAt: new Date()
    }
  })

  await prisma.assessment.upsert({
    where: { id: 'assess-001' },
    update: { result: 'Compliant', updatedAt: new Date() },
    create: {
      id: 'assess-001',
      status: 'Completed',
      result: 'Compliant',
      controlId: 'ctrl-nca-gov-01',
      riskId: risk1.id,
      updatedAt: new Date()
    }
  })

  await prisma.assessment.upsert({
    where: { id: 'assess-002' },
    update: { result: 'In Progress', updatedAt: new Date() },
    create: {
      id: 'assess-002',
      status: 'In Progress',
      result: null,
      controlId: 'ctrl-iso-ac-01',
      riskId: risk2.id,
      updatedAt: new Date()
    }
  })

  await prisma.evidence.create({
    data: {
      id: 'ev-001',
      name: 'Policy PDF',
      fileUrl: '/uploads/policy.pdf',
      fileType: 'application/pdf',
      assessmentId: 'assess-001',
      uploadedBy: 'user-admin-1'
    }
  })

  await prisma.evidence.create({
    data: {
      id: 'ev-002',
      name: 'Backup Screenshot',
      fileUrl: '/uploads/backup.png',
      fileType: 'image/png',
      assessmentId: 'assess-002',
      uploadedBy: 'user-admin-1'
    }
  })

  console.log('🎉 Minimal seed complete')
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
