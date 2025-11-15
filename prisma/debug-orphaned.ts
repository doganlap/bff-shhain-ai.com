import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Analyzing orphaned controls...\n')

  const orphaned = await prisma.grc_controls.findMany({
    where: { framework_id: null },
    take: 20,
    select: { id: true, control_id: true }
  })

  console.log(`Sample orphaned controls (${orphaned.length}):`)
  orphaned.forEach(c => {
    // Extract framework code from ID (e.g., "CMA-AML-1-1" -> "CMA-AML")
    const parts = c.id.split('-')
    const possibleCode = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : parts[0]
    console.log(`   ${c.id} -> possible framework: "${possibleCode}"`)
  })

  // Check what frameworks exist
  const frameworks = await prisma.grc_frameworks.findMany({ select: { id: true, name: true } })
  console.log(`\n📋 All frameworks (${frameworks.length}):`)
  frameworks.slice(0, 20).forEach(f => console.log(`   ${f.id}: ${f.name}`))

  await prisma.$disconnect()
}

main()
