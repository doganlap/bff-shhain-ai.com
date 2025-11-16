// Validate and fix controls to ensure all required fields are filled
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function validateAndFixControls() {
  console.log('🔍 Validating controls for required fields...\n')

  try {
    // Get all controls
    const controls = await prisma.grc_controls.findMany({
      include: {
        grc_frameworks: true
      }
    })

    console.log(`Total controls: ${controls.length}\n`)

    let missingFields = 0
    let fixed = 0

    for (const control of controls) {
      const issues: string[] = []
      const updates: any = {}

      // Check required fields
      if (!control.framework_id) issues.push('framework_id')
      if (!control.evidence_required === null) {
        issues.push('evidence_required')
        updates.evidence_required = true
      }
      if (!control.category) {
        issues.push('category')
        updates.category = 'general'
      }
      if (!control.risk_level) {
        issues.push('risk_level')
        updates.risk_level = 'medium'
      }

      // Note: sector, regulator, impact, priority, scope, target, version
      // need to be added to schema if they don't exist

      if (issues.length > 0) {
        missingFields++
        console.log(`❌ Control ${control.id}: Missing ${issues.join(', ')}`)

        // Fix the issues
        if (Object.keys(updates).length > 0) {
          await prisma.grc_controls.update({
            where: { id: control.id },
            data: {
              ...updates,
              updated_at: new Date()
            }
          })
          fixed++
        }
      }
    }

    console.log(`\n📊 Validation Summary:`)
    console.log(`   Total controls: ${controls.length}`)
    console.log(`   Controls with missing fields: ${missingFields}`)
    console.log(`   Controls fixed: ${fixed}`)

    if (missingFields === 0) {
      console.log('\n✅ All controls have required fields!')
    } else {
      console.log('\n⚠️  Some controls still need manual review')
    }

  } catch (error) {
    console.error('❌ Validation error:', error)
  }
}

validateAndFixControls()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
