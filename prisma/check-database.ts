// Quick check of Prisma Postgres database
import { PrismaClient } from '@prisma/client'

const url = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL
if (url) process.env.DATABASE_URL = url

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking Prisma Postgres Database')
  console.log('====================================\n')

  try {
    // Check frameworks
    const grcFrameworks = await prisma.grc_frameworks.count().catch(() => 0)
    console.log(`📋 GRC Frameworks: ${grcFrameworks}`)

    if (grcFrameworks > 0) {
      const frameworkList = await prisma.grc_frameworks.findMany({
        select: { id: true, name: true, total_controls: true }
      })
      frameworkList.forEach(f => {
        console.log(`   - ${f.name} (expected: ${f.total_controls})`)
      })
    }

    // Check controls
    console.log('\n🛡️  GRC Controls:')
    const totalControls = await prisma.grc_controls.count().catch(() => 0)
    console.log(`   Total: ${totalControls}`)

    const controlsByFramework = totalControls > 0
      ? await prisma.grc_controls.groupBy({ by: ['framework_id'], _count: true })
      : []

    for (const group of controlsByFramework) {
      if (!group.framework_id) {
        console.log(`   - (no framework): ${group._count} controls`)
        continue
      }
      const framework = await prisma.grc_frameworks.findUnique({
        where: { id: group.framework_id }
      })
      console.log(`   - ${framework?.name ?? group.framework_id}: ${group._count} controls`)
    }

    // Check other tables
    console.log('\n📊 Other Tables:')
    const tenants = await prisma.tenants.count().catch(() => 0)
    console.log(`   Tenants: ${tenants}`)

    const users = await prisma.users.count().catch(() => 0)
    console.log(`   Users: ${users}`)

    try {
      const orgs = await (prisma as any).organizations.count()
      console.log(`   Organizations: ${orgs}`)
    } catch (e: any) {
      console.log(`   Organizations: NOT FOUND`)
    }

    // Camel-case Prisma models seeded by app code
    console.log('\n📚 Prisma Models (camel-case):')
    const modelFrameworks = await prisma.framework.count().catch(() => 0)
    console.log(`   Framework: ${modelFrameworks}`)
    const modelControls = await prisma.control.count().catch(() => 0)
    console.log(`   Control: ${modelControls}`)
    const modelAssessments = await prisma.assessment.count().catch(() => 0)
    console.log(`   Assessment: ${modelAssessments}`)
    const modelRisks = await prisma.risk.count().catch(() => 0)
    console.log(`   Risk: ${modelRisks}`)
    const modelOrganizations = await prisma.organization.count?.().catch?.(() => 0) ?? 0
    console.log(`   Organization: ${modelOrganizations}`)

    // Check missing tables
    console.log('\n❓ Checking Expected Tables:')
    const expectedTables = [
      'framework_controls',
      'sector_controls',
      'control_evidence_requirements',
      'assessments',
      'assessment_controls',
      'licenses',
      'subscriptions',
      'audit_logs',
      'activity_logs'
    ]

    for (const table of expectedTables) {
      try {
        const count = await (prisma as any)[table].count()
        console.log(`   ✅ ${table}: ${count} rows`)
      } catch (e: any) {
        console.log(`   ❌ ${table}: NOT FOUND or empty`)
      }
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })


