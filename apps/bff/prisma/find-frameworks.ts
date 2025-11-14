import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Searching for CMA frameworks...\n')

  const cmaFrameworks = await prisma.grc_frameworks.findMany({
    where: { id: { startsWith: 'CMA' } }
  })

  console.log(`Found ${cmaFrameworks.length} CMA frameworks:`)
  cmaFrameworks.forEach(f => console.log(`  ${f.id}: ${f.name}`))

  console.log('\nSearching for MOH frameworks...\n')
  const mohFrameworks = await prisma.grc_frameworks.findMany({
    where: { id: { startsWith: 'MOH' } }
  })

  console.log(`Found ${mohFrameworks.length} MOH frameworks:`)
  mohFrameworks.forEach(f => console.log(`  ${f.id}: ${f.name}`))

  await prisma.$disconnect()
}

main()
