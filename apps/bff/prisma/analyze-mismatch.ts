import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'

const prisma = new PrismaClient()

async function readCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = []
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error))
  })
}

async function main() {
  console.log('🔍 Analyzing framework code mismatches...\n')

  const dbPath = path.join(process.cwd(), '..', '..', 'apps', 'web', 'database')

  // Get frameworks from CSV
  const frameworks = await readCSV(path.join(dbPath, 'unified_frameworks_enhanced.csv'))
  const frameworkCodes = new Set(frameworks.map(f => f.code))
  console.log(`📋 Frameworks in CSV: ${frameworkCodes.size}`)
  console.log(`   Codes: ${Array.from(frameworkCodes).slice(0, 10).join(', ')}...\n`)

  // Get controls from CSV
  const controls = await readCSV(path.join(dbPath, 'unified_controls_enhanced.csv'))
  const controlFrameworkCodes = new Set(controls.map(c => c.framework_code))
  console.log(`🛡️  Unique framework codes in controls: ${controlFrameworkCodes.size}`)
  console.log(`   Codes: ${Array.from(controlFrameworkCodes).slice(0, 10).join(', ')}...\n`)

  // Find mismatches
  const missingFrameworks = Array.from(controlFrameworkCodes).filter(code => !frameworkCodes.has(code))
  console.log(`⚠️  Framework codes in controls BUT NOT in frameworks (${missingFrameworks.length}):`)
  missingFrameworks.forEach(code => {
    const count = controls.filter(c => c.framework_code === code).length
    console.log(`   - ${code}: ${count} controls`)
  })

  console.log(`\n✅ Matching frameworks: ${Array.from(controlFrameworkCodes).filter(code => frameworkCodes.has(code)).length}`)

  // Get imported data
  const dbFrameworks = await prisma.grc_frameworks.findMany({ select: { id: true } })
  const dbControls = await prisma.grc_controls.findMany({ select: { id: true, framework_id: true } })

  console.log(`\n📊 Database Status:`)
  console.log(`   Frameworks: ${dbFrameworks.length}`)
  console.log(`   Controls: ${dbControls.length}`)
  console.log(`   Orphaned: ${dbControls.filter(c => !c.framework_id).length}`)

  await prisma.$disconnect()
}

main()
