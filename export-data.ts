// Export all data to local JSON files
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function exportData() {
  console.log('📦 Exporting data from Prisma database...\n')

  const exportDir = path.join(process.cwd(), 'exported-data')
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true })
  }

  try {
    // Export frameworks
    console.log('📋 Exporting frameworks...')
    const frameworks = await prisma.grc_frameworks.findMany()
    fs.writeFileSync(
      path.join(exportDir, 'frameworks.json'),
      JSON.stringify(frameworks, null, 2)
    )
    console.log(`   ✅ Exported ${frameworks.length} frameworks`)

    // Export controls
    console.log('🛡️  Exporting controls...')
    const controls = await prisma.grc_controls.findMany()
    fs.writeFileSync(
      path.join(exportDir, 'controls.json'),
      JSON.stringify(controls, null, 2)
    )
    console.log(`   ✅ Exported ${controls.length} controls`)

    // Export users if exists
    try {
      console.log('👥 Exporting users...')
      const users = await prisma.users.findMany()
      fs.writeFileSync(
        path.join(exportDir, 'users.json'),
        JSON.stringify(users, null, 2)
      )
      console.log(`   ✅ Exported ${users.length} users`)
    } catch (e) {
      console.log('   ⚠️  Users table not found or empty')
    }

    // Export tenants if exists
    try {
      console.log('🏢 Exporting tenants...')
      const tenants = await prisma.tenants.findMany()
      fs.writeFileSync(
        path.join(exportDir, 'tenants.json'),
        JSON.stringify(tenants, null, 2)
      )
      console.log(`   ✅ Exported ${tenants.length} tenants`)
    } catch (e) {
      console.log('   ⚠️  Tenants table not found or empty')
    }

    // Export organizations if exists
    try {
      console.log('🏛️  Exporting organizations...')
      const orgs = await prisma.organizations.findMany()
      fs.writeFileSync(
        path.join(exportDir, 'organizations.json'),
        JSON.stringify(orgs, null, 2)
      )
      console.log(`   ✅ Exported ${orgs.length} organizations`)
    } catch (e) {
      console.log('   ⚠️  Organizations table not found or empty')
    }

    // Create summary
    const summary = {
      exportDate: new Date().toISOString(),
      tables: {
        frameworks: frameworks.length,
        controls: controls.length
      }
    }

    fs.writeFileSync(
      path.join(exportDir, 'export-summary.json'),
      JSON.stringify(summary, null, 2)
    )

    console.log('\n✅ Export complete!')
    console.log(`📁 Data saved to: ${exportDir}`)

  } catch (error) {
    console.error('❌ Export error:', error)
  }
}

exportData()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
