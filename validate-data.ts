// Validate imported data
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function validate() {
  console.log('🔍 Validating Database Import...\n')

  try {
    // Count frameworks
    const frameworkCount = await prisma.grc_frameworks.count()
    console.log(`📋 Frameworks: ${frameworkCount}`)

    // Count controls
    const controlCount = await prisma.grc_controls.count()
    console.log(`🛡️  Controls: ${controlCount}`)

    // Sample some frameworks
    const frameworks = await prisma.grc_frameworks.findMany({
      take: 5,
      select: { id: true, name: true, total_controls: true }
    })
    console.log('\n📋 Sample Frameworks:')
    frameworks.forEach(fw => {
      console.log(`   - ${fw.id}: ${fw.name} (${fw.total_controls} controls)`)
    })

    // Sample some controls
    const controls = await prisma.grc_controls.findMany({
      take: 5,
      select: { id: true, title: true, framework_id: true }
    })
    console.log('\n🛡️  Sample Controls:')
    controls.forEach(ctrl => {
      console.log(`   - ${ctrl.id}: ${ctrl.title?.substring(0, 50)}...`)
    })

    console.log('\n✅ Database validation complete!')
    console.log(`\nExpected: 53 frameworks, 2303 controls`)
    console.log(`Found: ${frameworkCount} frameworks, ${controlCount} controls`)

    if (controlCount < 2303) {
      console.log(`\n⚠️  Missing ${2303 - controlCount} controls - import may have been interrupted`)
    }

  } catch (error) {
    console.error('❌ Validation error:', error)
  }
}

validate()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
