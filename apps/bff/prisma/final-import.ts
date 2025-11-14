// FINAL COMPLETE Import - Import ALL CSV data to Prisma Postgres
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
  console.log('🚀 FINAL COMPLETE IMPORT - ALL CSV Data to Prisma Postgres')
  console.log('============================================\n')

  const dbPath = path.join(process.cwd(), '..', '..', 'apps', 'web', 'database')
  let totalImported = 0

  // STEP 0: Load ALL existing frameworks from database and build mapping
  console.log('🔍 Loading ALL existing frameworks from database...')
  const existingFrameworks = await prisma.grc_frameworks.findMany({ select: { id: true } })
  const frameworkMapping = new Map<string, string>()
  existingFrameworks.forEach(fw => frameworkMapping.set(fw.id, fw.id))
  console.log(`✅ Loaded ${existingFrameworks.length} existing frameworks into mapping`)
  console.log(`   Sample: CMA-AML=${frameworkMapping.has('CMA-AML')}, MOH-PS=${frameworkMapping.has('MOH-PS')}\n`)

  // STEP 1: Import/Update Frameworks from CSV (53 rows)
  console.log('📋 Importing Frameworks from CSV...')
  const frameworks = await readCSV(path.join(dbPath, 'unified_frameworks_enhanced.csv'))
  let fwCount = 0

  for (const row of frameworks) {
    try {
      const frameworkCode = row.code || row.framework_code || `FW-${fwCount}`
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
  console.log(`✅ Imported/updated ${fwCount} frameworks from CSV`)
  console.log(`📋 Total framework mapping: ${frameworkMapping.size} unique codes\n`)
  totalImported += fwCount

  // STEP 2: Import Controls with proper framework linking (2303 rows)
  console.log('🛡️  Importing Controls (2303 rows)...')
  const controls = await readCSV(path.join(dbPath, 'unified_controls_enhanced.csv'))
  let ctrlCount = 0
  let skippedCount = 0
  let orphanedWarn = 0

  for (let i = 0; i < controls.length; i++) {
    const row = controls[i]
    try {
      const uniqueId = `${row.framework_code || 'CTRL'}-${row.control_number || i}`.replace(/[^a-zA-Z0-9-_]/g, '-')

      // Lookup framework_id
      const frameworkId = frameworkMapping.get(row.framework_code)
      if (!frameworkId && orphanedWarn < 5) {
        console.log(`   ⚠️  No framework found for code "${row.framework_code}" (control ${uniqueId})`)
        orphanedWarn++
      }

      await prisma.grc_controls.upsert({
        where: { id: uniqueId },
        update: { framework_id: frameworkId || null }, // Update framework_id if control exists
        create: {
          id: uniqueId,
          framework_id: frameworkId || null,
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
      if (skippedCount <= 5) {
        console.error(`Failed control ${i}: ${e.message}`)
      }
    }
  }
  console.log(`✅ Imported ${ctrlCount} controls (${skippedCount} skipped)\n`)
  totalImported += ctrlCount

  // FINAL SUMMARY
  console.log('============================================')
  console.log(`🎉 FINAL IMPORT COMPLETE!`)
  console.log(`   Frameworks: ${existingFrameworks.length} existing + ${fwCount} from CSV`)
  console.log(`   Controls: ${ctrlCount}`)
  console.log(`   Total: ${totalImported} records imported`)
  console.log('============================================\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
