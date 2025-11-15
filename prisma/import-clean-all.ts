// Import ALL CSV data to Prisma Postgres - FIXED VERSION
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'

const prisma = new PrismaClient()

async function readCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = []
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`)
      resolve([])
      return
    }
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error))
  })
}

async function main() {
  console.log('🚀 Importing ALL CSV Data to Prisma Postgres')
  console.log('============================================\n')

  const dbPath = path.join(process.cwd(), '..', '..', 'apps', 'web', 'database')
  let totalImported = 0

  // 0. Load ALL existing frameworks from database
  console.log('🔍 Loading existing frameworks from database...')
  const existingFrameworks = await prisma.grc_frameworks.findMany({ select: { id: true } })
  const frameworkMapping = new Map<string, string>()
  existingFrameworks.forEach(fw => frameworkMapping.set(fw.id, fw.id))
  console.log(`✅ Loaded ${existingFrameworks.length} existing frameworks\n`)

  // 1. Import Frameworks (53 rows from CSV)
  console.log('📋 Importing Frameworks from CSV (53 rows)...')
  const frameworks = await readCSV(path.join(dbPath, 'unified_frameworks_enhanced.csv'))
  let fwCount = 0

  for (const row of frameworks) {
    try {
      // CSV has "code" column not "framework_code"
      const frameworkCode = row.code || row.framework_code || `FW-${fwCount}`

      // Store mapping for controls to reference
      frameworkMapping.set(frameworkCode, frameworkCode)

      await prisma.grc_frameworks.upsert({
        where: { id: frameworkCode },
        update: {},
        create: {
          id: frameworkCode,
          name: row.title_en || row.framework_name || 'Unknown Framework',
          name_ar: row.title_ar || row.framework_name_ar,
          description: row.description_en || row.description,
          description_ar: row.description_ar,
          version: row.version,
          authority: row.regulator_code || row.authority,
          jurisdiction: 'Saudi Arabia',
          mandatory: row.mandatory === 'True' || row.mandatory === 'true',
          industry_sector: row.category || row.sector,
          total_controls: parseInt(row.total_controls || '0')
        }
      })
      fwCount++
    } catch (e: any) {
      console.error(`Failed framework ${row.code}: ${e.message}`)
    }
  }
  console.log(`✅ Imported ${fwCount} frameworks from CSV`)
  console.log(`📋 Total framework mapping: ${frameworkMapping.size} codes\n`)
  totalImported += fwCount  // 2. Import Controls (2303 rows)
  console.log('🛡️  Importing Controls (2303 rows)...')
  const controls = await readCSV(path.join(dbPath, 'unified_controls_enhanced.csv'))
  let ctrlCount = 0
  let skippedCount = 0

  for (let i = 0; i < controls.length; i++) {
    const row = controls[i]
    try {
      // Generate unique ID: framework_code-control_number
      const uniqueId = `${row.framework_code || 'CTRL'}-${row.control_number || i}`.replace(/[^a-zA-Z0-9-_]/g, '-')

      // Lookup framework_id from mapping
      const frameworkId = frameworkMapping.get(row.framework_code) || undefined

      await prisma.grc_controls.upsert({
        where: { id: uniqueId },
        update: {},
        create: {
          id: uniqueId,
          framework_id: frameworkId, // Now properly mapped!
          control_id: row.control_number || `ctrl-${i}`,
          title: row.title_en || 'Untitled Control',
          title_ar: row.title_ar,
          description: row.requirement_en || row.description,
          description_ar: row.requirement_ar || row.description_ar,
          category: row.domain || 'other',
          subcategory: row.control_type,
          risk_level: parseInt(row.maturity_level || '2') <= 2 ? 'low' : 'high',
          evidence_required: row.evidence_requirements ? true : false,
          implementation_guidance: row.implementation_guidance_en
        }
      })
      ctrlCount++
      if (ctrlCount % 500 === 0) {
        console.log(`   Progress: ${ctrlCount}/${controls.length}...`)
      }
    } catch (e: any) {
      skippedCount++
      if (skippedCount <= 10) {
        console.error(`Failed control ${i} (${row.framework_code}-${row.control_number}): ${e.message}`)
      } else if (skippedCount === 11) {
        console.error(`... (suppressing further errors)`)
      }
    }
  }
  console.log(`✅ Imported ${ctrlCount} controls (${skippedCount} skipped)\n`)
  totalImported += ctrlCount

  // 3. Summary
  console.log('============================================')
  console.log(`🎉 Import Complete!`)
  console.log(`   Frameworks: ${fwCount}`)
  console.log(`   Controls: ${ctrlCount}`)
  console.log(`   Total: ${totalImported} records`)
  console.log('============================================\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
