// Import ALL CSV data to Prisma Postgres
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

  // 1. Import Frameworks (53 rows)
  console.log('📋 Importing Frameworks (53 rows)...')
  const frameworks = await readCSV(path.join(dbPath, 'unified_frameworks_enhanced.csv'))
  const frameworkMapping = new Map<string, string>() // Map framework_code to framework_id
  let fwCount = 0

  for (const row of frameworks) {
    try {
      const frameworkId = row.framework_id || row.framework_code || row.id || `fw-${fwCount}`

      // Store mapping: framework_code -> framework_id
      if (row.framework_code) {
        frameworkMapping.set(row.framework_code, frameworkId)
      }
      if (row.id && row.id !== frameworkId) {
        frameworkMapping.set(row.id, frameworkId)
      }

      await prisma.grc_frameworks.upsert({
        where: { id: frameworkId },
        update: {},
        create: {
          id: frameworkId,
          name: row.framework_name || row.name || 'Unknown Framework',
          name_ar: row.framework_name_ar || row.name_ar,
          description: row.description,
          description_ar: row.description_ar,
          version: row.version,
          authority: row.authority,
          authority_ar: row.authority_ar,
          jurisdiction: row.jurisdiction || 'Saudi Arabia',
          mandatory: row.mandatory === 'true' || row.mandatory === '1' || row.is_mandatory === 'true',
          industry_sector: row.industry_sector || row.sector,
          total_controls: parseInt(row.total_controls || '0')
        }
      })
      fwCount++
    } catch (e: any) {
      console.error(`Failed: ${row.framework_name}: ${e.message}`)
    }
  }
  console.log(`✅ Imported ${fwCount} frameworks`)
  console.log(`📋 Framework mapping: ${frameworkMapping.size} codes mapped\n`)
  totalImported += fwCount

  // 2. Import Controls (2303 rows)
  console.log('🛡️  Importing Controls (2303 rows)...')
  const controls = await readCSV(path.join(dbPath, 'unified_controls_enhanced.csv'))
  let ctrlCount = 0
  let skippedCount = 0
  for (let i = 0; i < controls.length; i++) {
    const row = controls[i]
    try {
      // Generate unique ID from framework_code + control_number
      const uniqueId = `${row.framework_code || 'CTRL'}-${row.control_number || i}`.replace(/[^a-zA-Z0-9-_]/g, '-');

      // Lookup framework_id from mapping
      const mappedFrameworkId = row.framework_code ? frameworkMapping.get(row.framework_code) : undefined
      const finalFrameworkId = mappedFrameworkId || row.framework_id || undefined

      await prisma.grc_controls.upsert({
        where: { id: uniqueId },
        update: {},
        create: {
          id: uniqueId,
          framework_id: finalFrameworkId,
          control_id: row.control_number || row.control_code || row.control_id || `ctrl-${i}`,
          title: row.title_en || row.control_title || row.title || row.title_ar || 'Untitled Control',
          title_ar: row.title_ar || row.control_title_ar || undefined,
          description: row.requirement_en || row.control_description || row.description || undefined,
          description_ar: row.requirement_ar || row.control_description_ar || row.description_ar || undefined,
          category: row.domain || row.category || 'other',
          subcategory: row.control_type || row.subcategory || undefined,
          risk_level: row.maturity_level ?
            (parseInt(row.maturity_level) <= 2 ? 'low' : parseInt(row.maturity_level) === 3 ? 'medium' : 'high') :
            (row.risk_level || 'medium'),
          evidence_required: row.evidence_requirements ? true : (row.evidence_required === 'true' || row.evidence_required === '1'),
          implementation_guidance: row.implementation_guidance_en || row.implementation_guidance || undefined,
          implementation_guidance_ar: row.implementation_guidance_ar || undefined
        }
      })
      ctrlCount++
      if (ctrlCount % 200 === 0) {
        console.log(`   Progress: ${ctrlCount}/${controls.length}...`)
      }
    } catch (e: any) {
      skippedCount++
      if (skippedCount <= 10) { // Show first 10 errors for debugging
        console.error(`Failed control ${i} (${row.framework_code}-${row.control_number}): ${e.message}`)
      } else if (skippedCount === 11) {
        console.error(`... (suppressing further errors)`)
      }
    }
  }
  console.log(`✅ Imported ${ctrlCount} controls (${skippedCount} skipped)\n`)
  totalImported += ctrlCount

  // 3. Import Framework Controls Mapping (262 rows)
  console.log('🔗 Importing Framework-Control Mappings (262 rows)...')
  const mappings = await readCSV(path.join(dbPath, 'unified_cross_framework_control_mapping.csv'))
  let mapCount = 0
  for (const row of mappings) {
    try {
      await prisma.framework_controls.upsert({
        where: {
          framework_id_control_id: {
            framework_id: row.framework_id,
            control_id: row.control_id
          }
        },
        update: {},
        create: {
          id: `${row.framework_id}-${row.control_id}`,
          framework_id: row.framework_id,
          control_id: row.control_id,
          sequence: parseInt(row.sequence || '0'),
          mandatory: row.mandatory === 'true' || row.mandatory === '1'
        }
      })
      mapCount++
    } catch (e: any) {
      // Skip duplicates
    }
  }
  console.log(`✅ Imported ${mapCount} mappings\n`)
  totalImported += mapCount

  // 4. Import Sector Controls (108 rows)
  console.log('🏢 Importing Sector Controls (108 rows)...')
  const sectors = await readCSV(path.join(dbPath, 'unified_cross_sector_regulator_framework_mapping.csv'))
  let sectCount = 0
  for (const row of sectors) {
    try {
      await prisma.sector_controls.upsert({
        where: {
          sector_control_id: {
            sector: row.sector || row.sector_name,
            control_id: row.control_id || row.framework_id
          }
        },
        update: {},
        create: {
          id: `${row.sector}-${row.control_id || row.framework_id}`,
          sector: row.sector || row.sector_name,
          control_id: row.control_id || row.framework_id,
          applicability: row.applicability,
          mandatory: row.mandatory === 'true' || row.mandatory === '1'
        }
      })
      sectCount++
    } catch (e: any) {
      // Skip errors
    }
  }
  console.log(`✅ Imported ${sectCount} sector controls\n`)
  totalImported += sectCount

  console.log('============================================')
  console.log(`🎉 Total Imported: ${totalImported} records`)
  console.log('============================================')
  console.log('\n✅ Summary:')
  console.log(`   • ${fwCount} Frameworks`)
  console.log(`   • ${ctrlCount} Controls`)
  console.log(`   • ${mapCount} Framework Mappings`)
  console.log(`   • ${sectCount} Sector Controls`)
  console.log(`\n📊 Verify in Prisma Studio: http://localhost:5560`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
