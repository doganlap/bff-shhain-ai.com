// Quick check of Prisma Postgres database
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking Prisma Postgres Database')
  console.log('====================================\n')

  try {
    // Check frameworks
    const frameworks = await prisma.grc_frameworks.count()
    console.log(`📋 GRC Frameworks: ${frameworks}`)

    const frameworkList = await prisma.grc_frameworks.findMany({
      select: { id: true, name: true, total_controls: true }
    })
    frameworkList.forEach(f => {
      console.log(`   - ${f.name} (expected: ${f.total_controls})`)
    })

    // Check controls
    console.log('\n🛡️  GRC Controls:')
    const totalControls = await prisma.grc_controls.count()
    console.log(`   Total: ${totalControls}`)

    const controlsByFramework = await prisma.grc_controls.groupBy({
      by: ['framework_id'],
      _count: true
    })

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
    const tenants = await prisma.tenants.count()
    console.log(`   Tenants: ${tenants}`)

    const users = await prisma.users.count()
    console.log(`   Users: ${users}`)

    const orgs = await prisma.organizations.count()
    console.log(`   Organizations: ${orgs}`)

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


