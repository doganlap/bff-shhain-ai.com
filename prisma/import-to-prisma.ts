// =====================================================
// PRISMA POSTGRES BULK DATA IMPORT
// Imports all 5500+ records from local database
// =====================================================

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'

const prisma = new PrismaClient()

interface ImportStats {
  table: string
  imported: number
  failed: number
  skipped: number
}

const stats: ImportStats[] = []

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

async function importGRCFrameworks() {
  console.log('\n📋 Importing GRC Frameworks...')
  const data = await readCSV('export_grc_frameworks.csv')

  let imported = 0, failed = 0

  for (const row of data) {
    try {
      await prisma.grc_frameworks.upsert({
        where: { id: row.id },
        update: {},
        create: {
          id: row.id,
          name: row.name,
          name_ar: row.name_ar,
          description: row.description,
          description_ar: row.description_ar,
          version: row.version,
          effective_date: row.effective_date ? new Date(row.effective_date) : null,
          authority: row.authority,
          authority_ar: row.authority_ar,
          scope: row.scope,
          jurisdiction: row.jurisdiction,
          mandatory: row.mandatory === 'true' || row.mandatory === '1',
          industry_sector: row.industry_sector,
          compliance_level: row.compliance_level,
          total_controls: parseInt(row.total_controls) || 0,
          tenant_id: row.tenant_id || null,
          created_at: row.created_at ? new Date(row.created_at) : new Date(),
          updated_at: row.updated_at ? new Date(row.updated_at) : new Date()
        }
      })
      imported++
    } catch (error: any) {
      console.error(`Failed to import framework ${row.id}: ${error.message}`)
      failed++
    }
  }

  stats.push({ table: 'grc_frameworks', imported, failed, skipped: 0 })
  console.log(`✅ Imported ${imported} frameworks (${failed} failed)`)
}

async function importGRCControls() {
  console.log('\n🛡️  Importing GRC Controls (5500+ records)...')
  const data = await readCSV('export_grc_controls.csv')

  let imported = 0, failed = 0, skipped = 0

  console.log(`Found ${data.length} controls to import...`)

  // Process in batches for better performance
  const batchSize = 100
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)

    for (const row of batch) {
      try {
        await prisma.grc_controls.upsert({
          where: { id: row.id },
          update: {},
          create: {
            id: row.id,
            framework_id: row.framework_id,
            control_id: row.control_id,
            title: row.title,
            title_ar: row.title_ar,
            description: row.description,
            description_ar: row.description_ar,
            category: row.category,
            subcategory: row.subcategory,
            risk_level: row.risk_level,
            control_type: row.control_type,
            implementation_status: row.implementation_status || 'not_implemented',
            maturity_level: parseInt(row.maturity_level) || 0,
            evidence_required: row.evidence_required === 'true' || row.evidence_required === '1',
            testing_frequency: row.testing_frequency,
            implementation_guidance: row.implementation_guidance,
            implementation_guidance_ar: row.implementation_guidance_ar,
            related_regulations: row.related_regulations ? JSON.parse(row.related_regulations) : [],
            tenant_id: row.tenant_id || null,
            created_at: row.created_at ? new Date(row.created_at) : new Date(),
            updated_at: row.updated_at ? new Date(row.updated_at) : new Date()
          }
        })
        imported++

        if (imported % 500 === 0) {
          console.log(`   Progress: ${imported}/${data.length} controls imported...`)
        }
      } catch (error: any) {
        if (error.code === 'P2002') {
          skipped++
        } else {
          console.error(`Failed to import control ${row.control_id}: ${error.message}`)
          failed++
        }
      }
    }
  }

  stats.push({ table: 'grc_controls', imported, failed, skipped })
  console.log(`✅ Imported ${imported} controls (${failed} failed, ${skipped} skipped)`)
}

async function importTenants() {
  console.log('\n🏢 Importing Tenants...')
  const data = await readCSV('export_tenants.csv')

  let imported = 0, failed = 0

  for (const row of data) {
    try {
      await prisma.tenants.upsert({
        where: { id: row.id },
        update: {},
        create: {
          id: row.id,
          slug: row.slug,
          display_name: row.display_name,
          type: row.type,
          status: row.status || 'active',
          country: row.country,
          sector: row.sector,
          metadata: row.metadata ? JSON.parse(row.metadata) : {},
          created_at: row.created_at ? new Date(row.created_at) : new Date(),
          updated_at: row.updated_at ? new Date(row.updated_at) : new Date(),
          expires_at: row.expires_at ? new Date(row.expires_at) : null
        }
      })
      imported++
    } catch (error: any) {
      console.error(`Failed to import tenant ${row.slug}: ${error.message}`)
      failed++
    }
  }

  stats.push({ table: 'tenants', imported, failed, skipped: 0 })
  console.log(`✅ Imported ${imported} tenants (${failed} failed)`)
}

async function importUsers() {
  console.log('\n👥 Importing Users...')
  const data = await readCSV('export_users.csv')

  let imported = 0, failed = 0

  for (const row of data) {
    try {
      await prisma.users.upsert({
        where: { id: row.id },
        update: {},
        create: {
          id: row.id,
          tenant_id: row.tenant_id,
          email: row.email,
          password_hash: row.password_hash,
          full_name: row.full_name,
          role: row.role || 'user',
          is_partner: row.is_partner === 'true' || row.is_partner === '1',
          is_super_admin: row.is_super_admin === 'true' || row.is_super_admin === '1',
          metadata: row.metadata ? JSON.parse(row.metadata) : {},
          created_at: row.created_at ? new Date(row.created_at) : new Date(),
          updated_at: row.updated_at ? new Date(row.updated_at) : new Date(),
          last_login_at: row.last_login_at ? new Date(row.last_login_at) : null
        }
      })
      imported++
    } catch (error: any) {
      console.error(`Failed to import user ${row.email}: ${error.message}`)
      failed++
    }
  }

  stats.push({ table: 'users', imported, failed, skipped: 0 })
  console.log(`✅ Imported ${imported} users (${failed} failed)`)
}

async function importOrganizations() {
  console.log('\n🏛️  Importing Organizations...')
  const data = await readCSV('export_organizations.csv')

  let imported = 0, failed = 0

  for (const row of data) {
    try {
      await prisma.organizations.upsert({
        where: { id: row.id },
        update: {},
        create: {
          id: row.id,
          name: row.name,
          name_ar: row.name_ar,
          registration_number: row.registration_number,
          sector: row.sector,
          country: row.country,
          city: row.city,
          address: row.address,
          contact_email: row.contact_email,
          contact_phone: row.contact_phone,
          license_type: row.license_type,
          tenant_id: row.tenant_id,
          created_at: row.created_at ? new Date(row.created_at) : new Date(),
          updated_at: row.updated_at ? new Date(row.updated_at) : new Date()
        }
      })
      imported++
    } catch (error: any) {
      console.error(`Failed to import organization ${row.name}: ${error.message}`)
      failed++
    }
  }

  stats.push({ table: 'organizations', imported, failed, skipped: 0 })
  console.log(`✅ Imported ${imported} organizations (${failed} failed)`)
}

async function printSummary() {
  console.log('\n========================================')
  console.log('📊 IMPORT SUMMARY')
  console.log('========================================')

  let totalImported = 0
  let totalFailed = 0
  let totalSkipped = 0

  for (const stat of stats) {
    console.log(`\n${stat.table}:`)
    console.log(`  ✅ Imported: ${stat.imported}`)
    if (stat.failed > 0) console.log(`  ❌ Failed: ${stat.failed}`)
    if (stat.skipped > 0) console.log(`  ⏭️  Skipped: ${stat.skipped}`)

    totalImported += stat.imported
    totalFailed += stat.failed
    totalSkipped += stat.skipped
  }

  console.log('\n========================================')
  console.log(`Total Imported: ${totalImported}`)
  console.log(`Total Failed: ${totalFailed}`)
  console.log(`Total Skipped: ${totalSkipped}`)
  console.log('========================================')
}

async function main() {
  console.log('🚀 Starting Prisma Postgres Import')
  console.log('===================================')
  console.log('')

  try {
    // Import in correct order (respecting foreign keys)
    await importTenants()
    await importUsers()
    await importOrganizations()
    await importGRCFrameworks()
    await importGRCControls()
    // Add more import functions here as needed

    await printSummary()

    console.log('\n✅ Import complete!')
    console.log('🎯 Next steps:')
    console.log('  1. Verify data in Prisma Studio: http://localhost:5560')
    console.log('  2. Test API connections')
    console.log('  3. Start frontend application')

  } catch (error) {
    console.error('❌ Import failed:', error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
