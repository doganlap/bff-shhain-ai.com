import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verifying Prisma Database Import...\n')

  try {
    const frameworkCount = await prisma.grc_frameworks.count()
    const controlCount = await prisma.grc_controls.count()

    console.log(`✅ Frameworks: ${frameworkCount}`)
    console.log(`✅ Controls: ${controlCount}`)
    console.log(`✅ Total Records: ${frameworkCount + controlCount}\n`)

    if (frameworkCount > 0) {
      console.log('📋 Sample Frameworks:')
      const frameworks = await prisma.grc_frameworks.findMany({ take: 5 })
      frameworks.forEach(fw => console.log(`   - ${fw.id}: ${fw.name}`))
      console.log()
    }

    if (controlCount > 0) {
      console.log('🛡️  Sample Controls:')
      const controls = await prisma.grc_controls.findMany({ take: 5 })
      controls.forEach(ctrl => console.log(`   - ${ctrl.id}: ${ctrl.title.substring(0, 50)}...`))
      console.log()
    }

    // Check for orphaned controls (controls without valid framework_id)
    const orphanedControls = await prisma.grc_controls.count({
      where: { framework_id: null }
    })
    console.log(`⚠️  Orphaned Controls (no framework): ${orphanedControls}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
