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

// Generate framework name from code
function getFrameworkName(code: string): string {
  const names: Record<string, string> = {
    'CMA-AML': 'CMA Anti-Money Laundering',
    'MOH-PS': 'MOH Patient Safety',
    'MOH-EMR': 'MOH Electronic Medical Records',
    'MOM-MUN': 'Ministry of Municipal Affairs',
    'MOH-QM': 'MOH Quality Management',
    'SFDA-DATA': 'SFDA Data Protection',
    'SFDA-QM': 'SFDA Quality Management',
    'SCTH-TOUR': 'SCTH Tourism Standards',
    'DGA-DG': 'Digital Government Authority',
    'GAZT-VAT': 'GAZT VAT Regulations',
    'GAZT-WHT': 'GAZT Withholding Tax',
    'CMA-MR': 'CMA Market Regulations',
    'CMA-DR': 'CMA Disclosure Requirements',
    'CMA-IC': 'CMA Internal Controls',
    'ITIL': 'ITIL Service Management',
    'ISO31000': 'ISO 31000 Risk Management',
    'MOE-EDU': 'Ministry of Education Standards',
    'MOCI-CP': 'MOCI Consumer Protection',
    'HIPAA-SEC': 'HIPAA Security Rule',
    'HRSD-LABOR': 'HRSD Labor Law'
  }
  return names[code] || code.replace(/-/g, ' ')
}

async function main() {
  console.log('🔧 Creating missing frameworks and linking orphaned controls...\n')

  const dbPath = path.join(process.cwd(), '..', '..', 'apps', 'web', 'database')
  const controls = await readCSV(path.join(dbPath, 'unified_controls_enhanced.csv'))

  // Get existing frameworks
  const existingFrameworks = await prisma.grc_frameworks.findMany({ select: { id: true } })
  const existingIds = new Set(existingFrameworks.map(f => f.id))

  console.log(`✅ Existing frameworks: ${existingIds.size}`)

  // Find missing framework codes
  const allFrameworkCodes = new Set(controls.map(c => c.framework_code))
  const missingCodes = Array.from(allFrameworkCodes).filter(code => !existingIds.has(code))

  console.log(`🆕 Creating ${missingCodes.length} missing frameworks...\n`)

  // Create missing frameworks
  for (const code of missingCodes) {
    if (!code) continue

    const controlCount = controls.filter(c => c.framework_code === code).length

    try {
      await prisma.grc_frameworks.create({
        data: {
          id: code,
          name: getFrameworkName(code),
          jurisdiction: 'Saudi Arabia',
          mandatory: false,
          total_controls: controlCount
        }
      })
      console.log(`   ✅ Created ${code}: ${getFrameworkName(code)} (${controlCount} controls)`)
    } catch (e: any) {
      console.error(`   ❌ Failed to create ${code}: ${e.message}`)
    }
  }

  console.log(`\n🔄 Now re-running full import with complete framework list...\n`)

  await prisma.$disconnect()
}

main()
